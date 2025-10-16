import express from "express";
import auth from "../middleware/auth.js";
import {
  sendMessage,
  getAllMessages,
  getPreviousChat, 
} from "../controller/message.controller.js";
import {upload} from '../middleware/multer.js'

const router = express.Router();

router.post("/send/:receiverId", auth,upload.single('image'), sendMessage);
router.get("/getAll/:receiverId", auth, getAllMessages);
router.get("/previous", auth, getPreviousChat);

export default router;
