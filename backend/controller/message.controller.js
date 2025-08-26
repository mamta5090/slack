import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

// ✅ Send message
export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params; // chat partner
    const senderId = req.user._id;         // logged-in user
    const { message } = req.body;

    // 1. Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // 2. Create new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    await newMessage.save();

    // 3. Attach message to conversation
    conversation.messages.push(newMessage._id);
    await conversation.save();

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to send message" });
  }
};

// ✅ Get messages in a conversation
export const getMessagesByConversation = async (req, res) => {
  try {
    const { id: chatUser } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, chatUser] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    res.status(200).json(conversation.messages);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch messages" });
  }
};
