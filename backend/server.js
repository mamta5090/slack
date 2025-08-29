// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import userRouter from "./router/user.route.js";
// import cookieParser from "cookie-parser";
// import conversationRoute from "./router/conversation.route.js";
// import messageRoute from "./router/message.route.js";
// import { app, server } from "./socket.js";
// import User from "./models/User.js";
// import auth from "./middleware/auth.js"; // path matches your auth.js

// dotenv.config();

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// app.use(express.json());
// app.use(cookieParser());

// const PORT = process.env.PORT || 5000;

// app.get("/", (req, res) => {
//   res.send("server is running");
// });
// app.get("/api/user/me", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.userId).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });
//     res.json({ user });
//   } catch (err) {
//     console.error("GET /api/user/me error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.use("/api/user", userRouter);
// app.use("/api/conversation", conversationRoute);
// app.use("/api/message", messageRoute);

// connectDB();

// server.listen(PORT, () => {
//   console.log(`server is running at http://localhost:${PORT}`);
// });

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import userRouter from './router/user.route.js';
import conversationRoute from './router/conversation.route.js';
import messageRoute from './router/message.route.js';

import { app, server } from './socket.js';
import auth from './middleware/auth.js';
import User from './models/User.js'; // <-- make sure this path matches your project

dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('server is running'));

// ✅ Used by the frontend to restore the user on refresh
app.get('/api/user/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('GET /api/user/me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use('/api/user', userRouter);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', messageRoute);

connectDB();

server.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
