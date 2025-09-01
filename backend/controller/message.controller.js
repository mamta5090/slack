import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res
        .status(400)
        .json({ message: "senderId, receiverId and message are required" });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      message,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
    }

    const receiverIdStr = String(receiverId);
    const currentUnread = conversation.unread.get(receiverIdStr) || 0;
    conversation.unread.set(receiverIdStr, currentUnread + 1);

    await conversation.save();

    // --- START OF MODIFIED REAL-TIME LOGIC ---
    // A comment explaining the change: We now fetch the updated conversation and create a tailored payload for real-time updates.

    const updatedConvo = await Conversation.findById(conversation._id).populate(
      "participants",
      "name email"
    );

    // Payload for the person RECEIVING the message
    const receiverPayload = {
      _id: updatedConvo._id,
      other: updatedConvo.participants.find(p => String(p._id) === String(senderId)),
      unreadCount: updatedConvo.unread.get(receiverIdStr) || 0,
      updatedAt: updatedConvo.updatedAt,
    };
    
    // Payload for the person SENDING the message
    const senderPayload = {
      _id: updatedConvo._id,
      other: updatedConvo.participants.find(p => String(p._id) === String(receiverId)),
      unreadCount: updatedConvo.unread.get(String(senderId)) || 0, // Should be 0 for sender
      updatedAt: updatedConvo.updatedAt,
    };

    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        newMessage,
        updatedConversation: receiverPayload,
      });
    }

    const senderSocketId = getSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", {
        newMessage,
        updatedConversation: senderPayload,
      });
    }
    // --- END OF MODIFIED REAL-TIME LOGIC ---

    return res.status(200).json(newMessage);
  } catch (error) {
    console.error("sendMessage error:", error);
    return res
      .status(500)
      .json({ message: `send Message error ${error.message || error}` });
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