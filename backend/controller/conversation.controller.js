import Conversation from "../models/conversation.model.js";

export const createOrGetConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "senderId and receiverId required" });
    }

    let convo = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        members: [senderId, receiverId],
        lastMessageAt: new Date(),
      });
    }

    res.status(201).json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create/get conversation" });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      members: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .populate("members", "name email");

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id).populate("members", "name email");
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    res.json(convo);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch conversation" });
  }
};
