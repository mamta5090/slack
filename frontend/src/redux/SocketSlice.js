// redux/SocketSlice.js
import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    socket: null,      // <- store actual socket here (name matches selectors)
    onlineUsers: [],   // serializable data
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setOnlineUser: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearSocket: (state) => {
      state.socket = null;
      state.onlineUsers = [];
    },
  },
});

export const { setSocket, setOnlineUser, clearSocket } = socketSlice.actions;
export default socketSlice.reducer;
