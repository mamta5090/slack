import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import userRouter from './router/user.route.js';
import conversationRoute from './router/conversation.route.js';
import messageRoute from './router/message.route.js';
import inviteRouter from './router/invite.routes.js'

import { app, server } from './socket.js';
import auth from './middleware/auth.js';
import User from './models/User.js'; // <-- make sure this path matches your project

dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",                 // dev
  "https://slack-frontend-4.onrender.com"  // your deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());



const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('server is running'));

app.get("/favicon.ico", (req, res) => res.status(204).end()); 

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
app.use('/api/invite',inviteRouter)

connectDB();

server.listen(PORT, () => {
  console.log(`server is running at http://localhost:${PORT}`);
});
