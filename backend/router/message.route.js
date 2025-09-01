// router/message.route.js
import express from "express";
import auth from "../middleware/auth.js";
import {
  sendMessage,
  getAllMessages,
  getPreviousChat, 
} from "../controller/message.controller.js";

const router = express.Router();

router.post("/send/:receiverId", auth, sendMessage);
router.get("/getAll/:receiverId", auth, getAllMessages);

// ✅ NEW: recent chat partners sorted by updatedAt (most recent first)
router.get("/previous", auth, getPreviousChat);

export default router;
