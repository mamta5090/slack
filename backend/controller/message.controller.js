import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message } = req.body;
    let newMessage = await Message.create({
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
      });
    }
    conversation.messages.push(newMessage._id);
    await conversation.save();
    newMessage = await newMessage.populate("sender", "name email");
    const receiverSocketId = getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", { newMessage });
    }
    const senderSocketId = getSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", { newMessage });
    }
    return res.status(201).json(newMessage);
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