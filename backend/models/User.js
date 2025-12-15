import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    role: { type: String, default: "" },
    number: { type: String, default: "" },
    location: { type: String, default: "" },
    namePronunciation: { type: String, default: "" },
    date: { type: Date },
    title: { type: String, default: "" },
    topic: { type: String },
    
  
    status: {
      text: { type: String, default: "" },
      emoji: { type: String, default: "" }, 
      expiryTime: { type: Date, default: null },
      pauseNotifications: { type: Boolean, default: false }
    },


    notificationPausedUntil: { type: Date, default: null }
  },
  { timestamps: true }
);


userSchema.methods.cleanExpiredStatus = async function () {
  let isModified = false;
  const now = new Date();

  // 1. Clean Status
  if (this.status && this.status.expiryTime && now > new Date(this.status.expiryTime)) {
    this.status.text = "";
    this.status.emoji = "";
    this.status.expiryTime = null;
    isModified = true;
  }

  // 2. Clean Notification Pause
  if (this.notificationPausedUntil && now > new Date(this.notificationPausedUntil)) {
    this.notificationPausedUntil = null;
    this.status.pauseNotifications = false; // Sync the boolean
    isModified = true;
  }

  if (isModified) {
    await this.save();
  }
  return this;
};

const User = mongoose.model("User", userSchema);
export default User;