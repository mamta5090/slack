// socketServer.js (or whatever filename you use)
import http from 'http'
import express from 'express'
import { Server } from 'socket.io'


const app = express()
const server = http.createServer(app)

// socket.js (server)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],          // <- add this

  }
});



const userSocketMap = {}

export const getSocketId=(receiverId)=>{
    return userSocketMap[receiverId]
}

io.on("connection", (socket) => {
  let userId = socket.handshake.query?.userId || socket.handshake.auth?.userId;
  if (typeof userId === "string") userId = userId.trim();

  if (userId && userId !== "undefined" && userId !== "null") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUser", Object.keys(userSocketMap));

  // 🟢 Listen for messages from clients
  socket.on("sendMessage", (data) => {
    // broadcast to all users (or specific user if you want private chat)
    io.emit("newMessage", data);
  });

  // inside io.on("connection", socket => { ... })
socket.on("joinRoom", ({ roomId }) => {
  if (!roomId) return;
  socket.join(roomId);
  console.log("socket", socket.id, "joined room", roomId);
});

socket.on("leaveRoom", ({ roomId }) => {
  if (!roomId) return;
  socket.leave(roomId);
  console.log("socket", socket.id, "left room", roomId);
});


  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUser", Object.keys(userSocketMap));
  });
});




export { app, io, server }
