import express from "express";
import {
  personalNotifyHandler,
  channelNotifyHandler,
  getUserNotifications,
  markNotificationAsRead,
} from "../controller/notification.controller.js";

const router = express.Router();

router.post("/personal/notify", personalNotifyHandler);
router.post("/channel/notify", channelNotifyHandler);
router.get("/user/notifications", getUserNotifications);
router.put("/:notificationId/read", markNotificationAsRead);

export default router;
