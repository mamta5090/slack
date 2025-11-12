// models/User.js

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    role: { type: String, default: "" },
    number: { type: String, default: "" },
    location: { type: String, default: "" },
    namePronunciation: { type: String, default: "" },
    date: { type: Date }, 
    title: { type: String, default: "" },
     topic:{type:String},
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;