import express from "express";
import { sendMessage, getMessagesByConversation } from "../controller/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);
router.get("/getmessage/:id", protectRoute, getMessagesByConversation);

export default router;
