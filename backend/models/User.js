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
    
    // --- FIX START ---
    status: {
      text: { type: String, default: "" },
      emoji: { type: String, default: "" }, // Moved inside status, changed to String
      expiryTime: { type: Date, default: null }, // Moved inside status
      pauseNotifications: { type: Boolean, default: false } // Moved inside status
    },
    // --- FIX END ---
  },
  { timestamps: true }
);

// Middleware to clean status if expired
userSchema.methods.cleanExpiredStatus = async function () {
  if (this.status && this.status.expiryTime && new Date() > new Date(this.status.expiryTime)) {
    this.status = {
      text: "",
      emoji: "",
      expiryTime: null,
      pauseNotifications: false
    };
    await this.save();
  }
  return this;
};

const User = mongoose.model("User", userSchema);
export default User;