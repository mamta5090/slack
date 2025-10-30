// In frontend/src/socket.js

import { io } from "socket.io-client";

// The URL of your BACKEND server
const SERVER_URL = "http://localhost:5000"; 

// Create a socket instance and export it
// We will manage connecting and disconnecting in App.jsx
export const socket = io(SERVER_URL, {
  autoConnect: false, // We will manually connect it in App.jsx
  withCredentials: true,
});