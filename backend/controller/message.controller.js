import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/User.js"; // ✅ FIX 1: Import the User model to find mentioned users
import { getSocketId, io } from "../socket.js";
//import { deleteFromS3 } from '../config/s3.js';
import { createActivity } from './activity.controller.js'; // ✅ FIX 2: Import the activity helper

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message } = req.body;
    const imageUrl = req.file
      ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`
      : null;

    // ✅ FIX 3: Implement Mention Detection Logic
    let mentionedUserId = null;
    if (message) {
      // Use a regular expression to find mentions like @username
      const mentionRegex = /@(\w+)/; 
      const match = message.match(mentionRegex);

      if (match) {
        const mentionedUsername = match[1]; // Get the username from the regex match
        // Find the user in the database by their username
        const mentionedUser = await User.findOne({ name: mentionedUsername });
        if (mentionedUser) {
          mentionedUserId = mentionedUser._id;
        }
      }
    }
    // Note: A more advanced version could handle multiple mentions with `/g` flag and a loop.

    // First, save the message so we have an ID for it
    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      image: imageUrl,
    };
    let newMessage = await Message.create(messageData);

    // Find or create the conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // ✅ FIX 4: Create the activity AFTER the message and conversation exist
    // This ensures we have all the necessary IDs.
    if (mentionedUserId) {
        await createActivity({
            userId: mentionedUserId,         // The user who gets the notification
            // workSpace: conversation.workspaceId, // You need to add workspaceId to your Conversation model
            actor: senderId,                 // The user who performed the action
            action: 'mentioned_you',
            contentSnippet: newMessage.message.substring(0, 100),
            context: {
                id: conversation._id,
                model: 'Conversation'
            },
            target: {
                id: newMessage._id,
                model: 'Message'
            }
        });
    }
    
    // Continue with the rest of the logic
    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name email");
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", { newMessage: populatedMessage });
    }
    const senderSocketId = getSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", { newMessage: populatedMessage });
    }
    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: `Send Message error: ${error.message}` });
  }
};

// ... (the rest of your file is likely correct, no changes needed there)
export const getAllMessages = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "senderId and receiverId are required" });
    }
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      populate: { path: "sender", select: "name email" }, // optional: populate sender details
    });
    if (!conversation) return res.status(200).json([]);
    return res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("getAllMessages error:", error);
    return res
      .status(500)
      .json({ message: `getAllMessages error ${error.message || error}` });
  }
};

export const getPreviousChat = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate("participants", "-password")
      .sort({ updatedAt: -1 });
    const userMap = {};
    conversations.forEach((convo) => {
      convo.participants.forEach((user) => {
        if (String(user._id) !== String(currentUserId)) {
          userMap[user._id] = user;
        }
      });
    });
    const previousUsers = Object.values(userMap);
    return res.status(200).json(previousUsers);
  } catch (error) {
    console.error("getPreviousChat error:", error);
    return res
      .status(500)
      .json({ message: `previousUsers error ${error.message || error}` });
  }
};


export const deleteMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Only sender can delete their message
    if (msg.sender.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete image from S3 if it exists.
    // Prefer stored imageKey (recommended). Fallback: parse URL if needed.
    if (msg.imageKey) {
      try {
        await deleteFromS3(msg.imageKey);
      } catch (err) {
        console.error("Failed to delete S3 object (by imageKey):", err);
        // continue — don't block message deletion for S3 errors
      }
    } else if (msg.image && typeof msg.image === "string" && msg.image.includes(".amazonaws.com/")) {
      const parts = msg.image.split(".com/");
      const key = parts[1];
      if (key) {
        try {
          await deleteFromS3(key);
        } catch (err) {
          console.error("Failed to delete S3 object (parsed from image URL):", err);
        }
      }
    }

    // Delete the message document
    await Message.findByIdAndDelete(messageId);

    //     references to the message from any conversation documents
    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

    // Notify both users via sockets (use getSocketId to map userId -> socketId)
    const payload = { messageId };
    try {
      const senderSocketId = getSocketId(msg.sender.toString());
      const receiverSocketId = getSocketId(msg.receiver.toString());

      if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", payload);
      if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", payload);
    } catch (emitErr) {
      console.error("Socket emit error while deleting message:", emitErr);
    }

    return res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("deleteMessageController error:", error);
    return res.status(500).json({ message: "Failed to delete message", error: error.message });
  }
};