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
  },
});

const userSocketMap = {}; 

export const getSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on("call-user", (payload) => {
  //   try {
  //     const { to, from, roomID } = payload;
  //     const calleeSocketId = getSocketId(to);
  //     if (calleeSocketId) {
  //       io.to(calleeSocketId).emit("incoming-call", { from, roomID });
  //     } else {
  //       io.to(socket.id).emit("call-error", { message: "User is offline or unreachable" });
  //     }
  //   } catch (err) {
  //     console.error("call-user error:", err);
  //     io.to(socket.id).emit("call-error", { message: "Server error" });
  //   }
  // });

  // socket.on("answer-call", (payload) => {
  //   try {
  //     const { to, accepted, roomID } = payload;
  //     const callerSocketId = getSocketId(to);
  //     if (callerSocketId) {
  //       io.to(callerSocketId).emit("call-answered", {
  //         accepted,
  //         roomID,
  //         from: socket.handshake.query.userId,
  //       });
  //     } else {
  //       io.to(socket.id).emit("call-error", { message: "Caller is offline" });
  //     }
  //   } catch (err) {
  //     console.error("answer-call error:", err);
  //   }
  // });
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

   socket.on('webrtc:start-call', ({ to, from, offer }) => {
    console.log(`[Socket] Received webrtc:start-call from ${from.name} to user ${to}`);
    const calleeSocketId = getSocketId(to);
    if (calleeSocketId) {
      console.log(`[Socket] Forwarding webrtc:incoming-call to socket ${calleeSocketId}`);
      io.to(calleeSocketId).emit('webrtc:incoming-call', { from, offer });
    } else {
      console.log(`[Socket] ERROR: User ${to} is not online. Cannot start call.`);
    }
  });

  socket.on('webrtc:answer-call', ({ to, from, answer }) => {
    console.log(`[Socket] Received webrtc:answer-call from ${from.name} to user ${to}`);
    const callerSocketId = getSocketId(to);
    if (callerSocketId) {
      console.log(`[Socket] Forwarding webrtc:call-answered to socket ${callerSocketId}`);
      io.to(callerSocketId).emit('webrtc:call-answered', { from, answer });
    } else {
      console.log(`[Socket] ERROR: Original caller ${to} is not online. Cannot answer call.`);
    }
  });

  socket.on('webrtc:ice-candidate', ({ to, candidate }) => {
    // This will be very noisy, but it's essential for debugging
    console.log(`[Socket] Received webrtc:ice-candidate for user ${to}`);
    const recipientSocketId = getSocketId(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('webrtc:ice-candidate', { candidate });
    }
  });

  socket.on('webrtc:hang-up', ({ to }) => {
    console.log(`[Socket] Received webrtc:hang-up for user ${to}`);
    const recipientSocketId = getSocketId(to);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('webrtc:hang-up');
    }
  });


  socket.on("disconnect", () => {
    if (userId && userSocketMap[userId]) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});


export { app, io, server };
