import SlackUser from "../models/slackUser.model.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import {sendOtpEmail} from "../config/sendOtpEmail.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";
const RECAPTCHA_SECRET = process.env.SECRET_KEY; // 👈 from Google reCAPTCHA Admin Console

const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// ---------------- SIGNUP (NO captcha) ----------------
export const Signin = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    email = email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const exists = await SlackUser.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Create user (no captcha check here)
    const slackUser = await SlackUser.create({ email });
    const token = createToken(slackUser);

    return res.status(201).json({ message: "User created", user: slackUser, token });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ message: "Signin failed" });
  }
};

// ---------------- LOGIN (with captcha) ----------------
export const SlackLogin = async (req, res) => {
  try {
    let { email, captcha } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    email = email.toLowerCase().trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // ✅ Check captcha
    if (!captcha) {
      return res.status(400).json({ error: "Captcha required" });
    }

    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}`;
    const { data } = await axios.post(verifyURL);

    if (!data.success) {
      return res.status(400).json({ error: "Captcha verification failed" });
    }

    // ✅ Find user in DB
    const user = await SlackUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const token = createToken(user);
    return res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ---------------- OAUTH REDIRECTS ----------------
export const googleRedirect = (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  return res.redirect(clientUrl);
};

export const appleRedirect = (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  return res.redirect(clientUrl);
};

// controller/auth.controller.js

// Send OTP (you already have, just keep it)
export const SendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const slackUser = await SlackUser.findOne({ email });
    if (!slackUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    slackUser.otp = otp;
    slackUser.otpExpiry = Date.now() + 1 * 60 * 1000;
    await slackUser.save();

    await sendOtpEmail({ to: email, otp });

    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    console.error("Error sending OTP:", error);  // ✅ log full error
    res.status(500).json({ success: false, message: error.message });
  }
};


// Verify OTP
export const VerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const slackUser = await SlackUser.findOne({ email });
    if (!slackUser) {
      return res.status(400).json({ message: "User not found" });
    }

    if (slackUser.otp !== otp || Date.now() > slackUser.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // clear otp
    slackUser.otp = undefined;
    slackUser.otpExpiry = undefined;
    await slackUser.save();

    const token = createToken(slackUser);

    return res.status(200).json({
      success: true,
      message: "OTP verified, login successful",
      token,
      user: slackUser,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
};



