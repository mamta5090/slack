import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../socket.js";
import {uploadOnCloudinary} from '../config/cloudinary.js';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message } = req.body;
    let imageUrl = null;

    // Step 1: Handle the image upload if a file exists
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      if (uploadResult && uploadResult.url) {
        imageUrl = uploadResult.url;
      } else {
        console.error("Cloudinary upload failed, but proceeding without image.");
      }
    }

    // --- THE FIX IS HERE ---
    // Step 2: Build an object with ALL the message data first.
    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message: message || '',
    };

    // If an image was uploaded, add its URL to the data object.
    if (imageUrl) {
      messageData.image = imageUrl;
    }

    // Step 3: Create the new message in the database with the complete data object.
    // This ensures the 'image' field is saved permanently.
    let newMessage = await Message.create(messageData);


    // Step 4: Find or create the conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Step 5: Update the conversation
    conversation.messages.push(newMessage._id);
    await conversation.save();

    // Step 6: Populate sender details for the response
    const populatedMessage = await Message.findById(newMessage._id).populate("sender", "name email");

    // Step 7: Emit via sockets and send the response
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