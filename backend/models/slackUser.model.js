import mongoose from "mongoose";

const slackUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, 
  },
  createdAt: {
      type: Date,
      default: Date.now,
    },
    teamName: {
    type: String,
    default: ""
  },
    name: {
    type: String,
    default: ""
  },
    profile: {
    type: String,
    default: ""
  },
    otp: String,
otpExpiry: Date,
},{timestamps:true});

const SlackUser = mongoose.model("SlackUser", slackUserSchema);
export default SlackUser;