import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/User.js"; 
import { getSocketId, io } from "../socket.js";
import { deleteFromS3 } from '../config/s3.js';
import { createActivity } from './activity.controller.js'; 
import { createAndSendNotification } from '../config/notification.service.js';

const NOTIFICATION_COOLDOWN_MS = 1 * 60 * 1000;

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.params;
    const { message } = req.body;

    // If you're using multer + s3, multer might provide req.file (single) or req.files (array)
    const filesArray = [];

    if (req.file) {
      // single file upload
      filesArray.push({
        name: req.file.originalname || req.file.key || "file",
        url: req.file.location || req.file.path || "",
        mimetype: req.file.mimetype || "",
        key: req.file.key || "",
      });
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const f of req.files) {
        filesArray.push({
          name: f.originalname || f.key || "file",
          url: f.location || f.path || "",
          mimetype: f.mimetype || "",
          key: f.key || "",
        });
      }
    }

    if (!message && filesArray.length === 0 && !req.file && !req.files) {
      return res.status(400).json({ message: "Message content cannot be empty." });
    }

    // create message (keep backwards-compatible image fields if single image)
    const docToCreate = {
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      files: filesArray,
    };

    // If single file and it looks like an image, also keep image / imageKey for old code
    if (filesArray.length === 1 && filesArray[0].mimetype?.startsWith?.("image/")) {
      docToCreate.image = filesArray[0].url;
      docToCreate.imageKey = filesArray[0].key || "";
    }

    const newMessage = await Message.create(docToCreate);

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
    const senderSocketId = getSocketId(senderId);

    // Emit to sender (so the sender's other tabs update)
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", {
        newMessage: populatedNewMessage,
        updatedConversation
      });
    }

    if (receiverSocketId) {
      // online receiver -> real-time
      io.to(receiverSocketId).emit("newMessage", {
        newMessage: populatedNewMessage,
        updatedConversation
      });
    } else {
      // offline -> persistent notification record
      if (sender) {
        console.log(`User ${receiverId} is offline. Saving notification to DB.`);
        await createAndSendNotification({
          userId: receiverId,
          type: "personal_message",
          actorId: senderId,
          title: `New message from ${sender.name}`,
          body: message || "Sent a file",
        });
      }
    }

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

export const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    // Find conversation and set the current user's unread count to 0
    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: { [`unreadCounts.${currentUserId}`]: 0 }
      },
      { new: true } // Return the updated document
    ).populate("participants", "name email profilePic");

    if (!updatedConversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Optional: Emit a socket event to the user themselves so all their tabs update
    // io.to(getSocketId(currentUserId)).emit("conversationUpdated", updatedConversation);

    return res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("markAsRead error:", error);
    return res.status(500).json({ message: error.message });
  }
};