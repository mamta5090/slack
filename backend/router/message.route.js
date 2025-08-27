import express from "express";
import { sendMessage, getPreviousChat, getAllMessages } from "../controller/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import auth from "../middleware/auth.js";
//import auth from '../middleware/auth.js'
const router = express.Router();

router.post("/send/:receiverId",auth,  sendMessage);
router.get("/getAll/:receiverId",auth, getAllMessages);
router.get("/prevChats",auth,getPreviousChat)

export default router;
