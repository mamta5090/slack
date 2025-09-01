// // models/conversation.model.js
// import mongoose from "mongoose";
// const conversationSchema = new mongoose.Schema({
//   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//   messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
// }, { timestamps: true });

// export default mongoose.model("Conversation", conversationSchema);
// models/conversation.model.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
    // NEW: unread counters per userId -> number
    unread: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
