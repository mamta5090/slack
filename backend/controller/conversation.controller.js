// controller/conversation.controller.js
import Conversation from "../models/conversation.model.js";
export const getMyConversations = async (req, res) => {
  try {
    const me = req.userId;
    const convos = await Conversation.find({ participants: me })
      .sort({ updatedAt: -1 })
      .populate("participants", "name email");

    const data = convos.map((c) => {
      const other = c.participants.find((p) => String(p._id) !== String(me));
      const unreadCount = Number(c.unread?.get?.(String(me)) || 0);
      return {
        _id: c._id,
        other,
        unreadCount,
        updatedAt: c.updatedAt,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("getMyConversations error:", err);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

// POST /api/conversation/read/:otherUserId
export const markAsRead = async (req, res) => {
  try {
    const me = req.userId;
    const otherUserId = req.params.otherUserId;

    const convo = await Conversation.findOne({
      participants: { $all: [me, otherUserId] },
    });

    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });

    convo.unread.set(String(me), 0);
    await convo.save();
    res.json({ ok: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

export const createOrGetConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({ message: "senderId and receiverId required" });
    }

    let convo = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [senderId, receiverId],
        lastMessageAt: new Date(),
      });
    }

    res.status(201).json(convo);
  } catch (err) {
    console.error("createOrGetConversation error:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to create/get conversation" });
  }
};

export const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "name email");

    res.json(conversations);
  } catch (err) {
    console.error("getUserConversations error:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch conversations" });
  }
};

export const getConversationById = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id).populate(
      "participants",
      "name email"
    );
    if (!convo)
      return res.status(404).json({ message: "Conversation not found" });
    res.json(convo);
  } catch (err) {
    console.error("getConversationById error:", err);
    res
      .status(500)
      .json({ message: err.message || "Failed to fetch conversation" });
  }
};
