import express from "express";
import { sendMessage, getMessagesByConversation } from "../controller/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send/:id",  sendMessage);
router.get("/getmessage/:id", getMessagesByConversation);

export default router;
