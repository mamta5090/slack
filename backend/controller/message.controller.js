import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/User.js"; 
import { getSocketId, io } from "../socket.js";
// import { deleteFromS3 } from '../config/s3.js';
import { createActivity } from './activity.controller.js'; 
import { createAndSendNotification } from '../config/notification.service.js';

const NOTIFICATION_COOLDOWN_MS = 1 * 60 * 1000;

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.params;
    const { message } = req.body;
    const image = req.file ? req.file.location : null; 
    const imageKey = req.file ? req.file.key : null; 

    if (!message && !image) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      image: image,
      imageKey: imageKey,
    });

    const updatedConversation = await Conversation.findOneAndUpdate(
      { participants: { $all: [senderId, receiverId] } }, 
      {
        $push: { messages: newMessage._id }, 
        $inc: { [`unreadCounts.${receiverId}`]: 1 }, 
        lastNotificationSentAt: new Date(),
        updatedAt: new Date(),
      },
      { 
        upsert: true, 
        new: true,
      }
    ).populate("participants", "name email profilePic"); 

    if (!updatedConversation) {
        return res.status(500).json({ message: "Failed to find or create conversation." });
    }

    const populatedNewMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email profilePic");

       const sender = await User.findById(senderId).select("name");
    const receiverSocketId = getSocketId(receiverId);
    
   io.to(getSocketId(senderId)).emit("newMessage", {
        newMessage: populatedNewMessage,
        updatedConversation: updatedConversation
    });

    if (receiverSocketId) {
        // User is ONLINE: send the real-time message
      io.to(receiverSocketId).emit("newMessage", {
        newMessage: populatedNewMessage,
        updatedConversation: updatedConversation
      });
    }else{
      // User is OFFLINE: save a persistent notification to MongoDB
      if (sender) {
        console.log(`User ${receiverId} is offline. Saving notification to DB.`);
        await createAndSendNotification({
          userId: receiverId, // The offline user
          type: "personal_message",
          actorId: senderId,
          title: `New message from ${sender.name}`,
          body: message || "Sent an image",
        });
      }
    }
     io.to(getSocketId(senderId)).emit("newMessage", { /* payload */ });
    return res.status(201).json(populatedNewMessage);

  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ message: `Send Message error: ${error.message}` });
  }
};

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
      populate: { path: "sender", select: "name email" },
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

// export const getPreviousChat = async (req, res) => {
//   try {
//     const currentUserId = req.userId;
//     const conversations = await Conversation.find({
//       participants: currentUserId,
//     })
//       .populate("participants", "-password")
//       .sort({ updatedAt: -1 });
//     const userMap = {};
//     conversations.forEach((convo) => {
//       convo.participants.forEach((user) => {
//         if (String(user._id) !== String(currentUserId)) {
//           userMap[user._id] = user;
//         }
//       });
//     });
//     const previousUsers = Object.values(userMap);
//     return res.status(200).json(previousUsers);
//   } catch (error) {
//     console.error("getPreviousChat error:", error);
//     return res
//       .status(500)
//       .json({ message: `previousUsers error ${error.message || error}` });
//   }
// };


export const deleteMessageController = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    if (!messageId) {
      return res.status(400).json({ message: "messageId is required" });
    }
    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (msg.sender.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (msg.imageKey) {
      try {
        await deleteFromS3(msg.imageKey);
      } catch (err) {
        console.error("Failed to delete S3 object (by imageKey):", err);
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

    await Message.findByIdAndDelete(messageId);

    await Conversation.updateMany(
      { messages: messageId },
      { $pull: { messages: messageId } }
    );

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