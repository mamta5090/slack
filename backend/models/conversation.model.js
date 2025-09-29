import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    unread: { type: Map, of: Number, default: {} },
     isGroup: {
      type: Boolean,
      default: false,
    },
      lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    unread: {
      type: Map,
      of: Number,
      default: {},
    },
    topic: {
        type: String,
        default: "",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
