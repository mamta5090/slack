import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  receiver: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Channel',
    required: false
  },
  message: { 
    type: String, 
    default: "" 
  },
  image: {
    type: String,
    default: "",
  },
}, { timestamps: true }); 

messageSchema.pre('save', function(next) {
  if (!this.receiver && !this.channel) {
    return next(new Error('A message must have either a `receiver` or a `channel`.'));
  }
  if (this.receiver && this.channel) {
    return next(new Error('A message cannot have both a `receiver` and a `channel`.'));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);
export default Message;