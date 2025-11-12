import http from "http";
import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    //allowedHeaders: ["Content-Type"],
  },
});

const userSocketMap = {}; 

export const getSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  // map the connected user's id -> socket.id
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  // broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // forward a call request from caller -> callee
  // payload { to: calleeUserId, from: { id, name }, roomID }
  socket.on("call-user", (payload) => {
    try {
      const { to, from, roomID } = payload;
      const calleeSocketId = getSocketId(to);
      if (calleeSocketId) {
        io.to(calleeSocketId).emit("incoming-call", { from, roomID });
      } else {
        io.to(socket.id).emit("call-error", { message: "User is offline or unreachable" });
      }
    } catch (err) {
      console.error("call-user error:", err);
      io.to(socket.id).emit("call-error", { message: "Server error" });
    }
  });

  // forward answer from callee -> caller
  // payload { to: callerUserId, accepted: true|false, roomID }
  socket.on("answer-call", (payload) => {
    try {
      const { to, accepted, roomID } = payload;
      const callerSocketId = getSocketId(to);
      if (callerSocketId) {
        // include who answered (callee id) — socket.handshake.query.userId is callee
        io.to(callerSocketId).emit("call-answered", {
          accepted,
          roomID,
          from: socket.handshake.query.userId,
        });
      } else {
        io.to(socket.id).emit("call-error", { message: "Caller is offline" });
      }
    } catch (err) {
      console.error("answer-call error:", err);
    }
  });

  // forwarding messages (you already have)
  socket.on("sendMessage", (payload) => {
    const receiverSocketId = getSocketId(payload.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", payload);
    }
  });

  socket.on("joinChannel", (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel room: ${channelId}`);
  });

  socket.on("leaveChannel", (channelId) => {
    socket.leave(channelId);
    console.log(`User ${socket.id} left channel room: ${channelId}`);
  });

  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


export { app, io, server };
