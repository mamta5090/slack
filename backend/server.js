import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import userRouter from './router/user.route.js';
import conversationRoute from './router/conversation.route.js';
import messageRoute from './router/message.route.js';
import inviteRouter from './router/invite.routes.js';

import { app, server } from './socket.js';  // <-- app comes from socket.js
import auth from './middleware/auth.js';
import User from './models/User.js';

dotenv.config();

// ✅ Proper CORS setup
app.use(
  cors({
    origin: [
      "http://localhost:5173",   // local frontend
      "https://slack-frontend-4.onrender.com" // deployed frontend domain
    ],
    credentials: true, // allow cookies/headers
  })
);

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

// Routes
app.use('/api/user', userRouter);
app.use('/api/conversation', conversationRoute);
app.use('/api/message', messageRoute);
app.use('/api/invite', inviteRouter);

// Connect DB
connectDB();

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
