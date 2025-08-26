import express from "express";
import {
  createOrGetConversation,
  getUserConversations,
  getConversationById,
} from "../controller/conversation.controller.js";

const router = express.Router();

router.post("/", createOrGetConversation);
router.get("/user/:userId", getUserConversations);
router.get("/:id", getConversationById);

export default router;
