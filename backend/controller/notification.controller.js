import Message from '../models/message.model.js';
import Channel from '../models/channel.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import {sendNotificationToUserSocket} from '../socket.js';
import { createAndSendNotification } from '../config/notification.service.js';


export const personalNotifyHandler = async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId) return res.status(400).json({ success: false, message: "messageId required" });

    const message = await Message.findById(messageId).populate("sender").populate("receiver");
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    const receiverId = message.receiver._id;
    const title = `New message from ${message.sender.name}`;
    const body = message.content || "";

    const notif = await createAndSendNotification({
      userId: receiverId,
      type: "personal",
      actorId: message.sender._id,
      messageId: message._id,
      title,
      body,
      data: { messageId: message._id },
    });

    return res.json({ success: true, notification: notif });
  } catch (err) {
    console.error("personalNotifyHandler error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const channelNotifyHandler = async (req, res) => {
  try {
    const { messageId } = req.body;
    if (!messageId) return res.status(400).json({ success: false, message: "messageId required" });

    const message = await Message.findById(messageId).populate("sender").populate("channel");
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    const channel = message.channel;
    if (!channel) return res.status(400).json({ success: false, message: "Channel not found on message" });

    // fetch members excluding sender
    const members = await User.find({ _id: { $in: channel.members, $ne: message.sender._id } });
    const created = [];
    for (const member of members) {
      const notif = await createAndSendNotification({
        userId: member._id,
        type: "channel",
        actorId: message.sender._id,
        channelId: channel._id,
        messageId: message._id,
        title: `New message in #${channel.name} from ${message.sender.name}`,
        body: message.content || "",
        data: { messageId: message._id, channelId: channel._id },
      });
      created.push(notif);
    }

    return res.json({ success: true, count: created.length });
  } catch (err) {
    console.error("channelNotifyHandler error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notif = await Notification.findById(notificationId);
    if (!notif) return res.status(404).json({ success: false, message: "Notification not found" });
    notif.isRead = true;
    await notif.save();
    res.json({ success: true, message: "Notification marked as read", notification: notif });
  } catch (err) {
    console.error("markNotificationAsRead error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error("getUserNotifications error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createVoiceCallNotification = async ({ userId, actorId, callType, callData }) => {
  try {
    const actor = await User.findById(actorId);
    if (!actor) throw new Error("Actor user not found");
    const title = `Incoming ${callType} call from ${actor.name}`;
    const body = `${actor.name} is calling you.`;

    const notif = await createAndSendNotification({
      userId,
      type: "call",
      actorId,
      title,
      body,
      data: callData,
    });

    return notif;
  } catch (err) {
    console.error("createVoiceCallNotification error:", err);
    throw err;
  }
};