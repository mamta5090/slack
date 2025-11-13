import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../socket.js";
import { deleteFromS3 } from '../config/s3.js';
// import {uploadOnCloudinary} from '../config/cloudinary.js';

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { message } = req.body;
    // let imageUrl = null;
    // if (req.file) {
    //   const uploadResult = await uploadOnCloudinary(req.file.path);
    //   if (uploadResult && uploadResult.url) {
    //     imageUrl = uploadResult.url;
    //   } else {
    //     console.error("Cloudinary upload failed, but proceeding without image.");
    //   }
    // }

       // 3. S3 Image URL
    const imageUrl = req.file
      ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${req.file.key}`
      : null;

    const messageData = {
      sender: senderId,
      receiver: receiverId,
      message: message || '',
      image:imageUrl,
    };

   //if (imageKey) messageData.image = `${process.env.S3_PUBLIC_URL}/${imageKey}`;
    let newMessage = await Message.create(messageData);
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

// controllers/message.controller.js
export const deleteMessageController = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userId;

  const msg = await Message.findById(messageId);
  if (!msg) return res.status(404).json({ message: "Not found" });
  if (msg.sender.toString() !== userId)
    return res.status(403).json({ message: "Not authorized" });

  // Delete image from S3 if exists
  if (msg.image) {
    const key = msg.image.split(".com/")[1];
    await deleteFromS3(key);
  }

  await Message.findByIdAndDelete(messageId);

  // Emit to both users
  io.to(msg.sender.toString()).emit("messageDeleted", { messageId });
  io.to(msg.receiver.toString()).emit("messageDeleted", { messageId });

  res.json({ success: true });
};