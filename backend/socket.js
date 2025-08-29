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
  
  let userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  if (typeof userId === "string") userId = userId.trim();

  if (userId && userId !== "undefined" && userId !== "null") {
    userSocketMap[userId] = socket.id;
  }

  
  io.emit("getOnlineUser", Object.keys(userSocketMap));

  
  socket.on("sendMessage", (payload) => {
    const receiverSocketId = getSocketId(payload.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", payload);
    }
  
  });

  socket.on("disconnect", () => {
  
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
});

export { app, io, server };
