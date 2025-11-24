import Notification from "../models/notification.model.js";
import {sendNotificationToUserSocket} from '../socket.js';

export const createAndSendNotification = async ({ userId, type, actorId, channelId, messageId, title, body, data = {} }) => {
  const notif = await Notification.create({
    userId,
    type,
    actorId,
    channelId,
    messageId,
    title,
    body,
    data,
    createdAt: new Date()
  });
  
  const payload = {
    id: notif._id,
    type,
    title,
    body,
    data: notif.data,
    createdAt: notif.createdAt,
  };
  const sent = sendNotificationToUserSocket(String(userId), payload);
  return notif;
};