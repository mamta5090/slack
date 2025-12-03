import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: String,
  url: String,
  mimetype: String,
  key: String, // S3 key (if you have it)
});

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
    default: "" ,
    trim: true,
  },
  // Backwards compatible single-image fields (you already use these)
  image: {
    type: String,
    default: "",
  },
  imageKey: {
    type: String,
    default: ""
  },
  // New files array - holds images & docs
  files: {
    type: [fileSchema],
    default: []
  },
  isDeleted: {
    type: Boolean,
    default: false,
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
