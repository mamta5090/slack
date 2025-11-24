import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/User.js"; // ✅ FIX 1: Import the User model to find mentioned users
import { getSocketId, io } from "../socket.js";
import { deleteFromS3 } from '../config/s3.js';
import { createActivity } from './activity.controller.js'; // ✅ FIX 2: Import the activity helper

const NOTIFICATION_COOLDOWN_MS = 1 * 60 * 1000;

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.params;
    const { message } = req.body;
    // Assuming you handle file uploads with middleware like multer
    const image = req.file ? req.file.location : null; // Example for S3
    const imageKey = req.file ? req.file.key : null; // Example for S3

    if (!message && !image) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    // --- Step 1: Create the new message document ---
    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      image: image,
      imageKey: imageKey,
    });

    // --- Step 2: Atomically find or create the conversation and update it ---
    // This single operation replaces the multiple separate steps you had before.
    const updatedConversation = await Conversation.findOneAndUpdate(
      { participants: { $all: [senderId, receiverId] } }, // Find the conversation
      {
        $push: { messages: newMessage._id }, // Add the new message's ID
        $inc: { [`unreadCounts.${receiverId}`]: 1 }, // Increment unread count for the receiver
        lastNotificationSentAt: new Date(), // Update timestamp
        updatedAt: new Date(),
      },
      { 
        upsert: true, // If conversation doesn't exist, create it
        new: true, // Return the updated document
      }
    ).populate("participants", "name email profilePic"); // Populate for the socket payload

    if (!updatedConversation) {
        // This should theoretically not be hit due to upsert: true, but it's good practice
        return res.status(500).json({ message: "Failed to find or create conversation." });
    }

    // --- Step 3: Populate the new message for the socket payload ---
    const populatedNewMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email profilePic");

    // --- Step 4: Emit socket events to both users ---
    const receiverSocketId = getSocketId(receiverId);
    
    // The sender's own client will optimistically update, but we send the final
    // data back to ensure consistency.
    io.to(getSocketId(senderId)).emit("newMessage", {
        newMessage: populatedNewMessage,
        updatedConversation: updatedConversation
    });

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        newMessage: populatedNewMessage,
        updatedConversation: updatedConversation
      });
    }
    
    return res.status(201).json(populatedNewMessage);

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