import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true,trim: true,},
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    role: { type: String, default: "" },
    number: { type: String, default: "" },
    location: { type: String, default: "" },
    namePronunciation: { type: String, default: "" },
    date: { type: Date }, 
    title: { type: String, default: "" },
     topic:{type:String},
     status:{
      text:{type:String, default:""},
     },
     emoji:{type:Date,default:""},
     pauseNotifications:{type:Boolean,default:false}
  },
  { timestamps: true }
);

// Middleware to clean status if expired when accessing the user
userSchema.methods.cleanExpiredStatus = function() {
  if (this.status.expiryTime && new Date() > this.status.expiryTime) {
    this.status = {
      text: "",
      emoji: "",
      expiryTime: null,
      pauseNotifications: false
    };
    return this.save();
  }
  return Promise.resolve(this);
};

const User = mongoose.model("User", userSchema);
export default User;