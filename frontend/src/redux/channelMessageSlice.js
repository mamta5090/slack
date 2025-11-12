// src/redux/channelMessageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const channelMessageSlice = createSlice({
  name: "channelMessage",
  initialState: {
    channelMessages: [],
  },
  reducers: {
    setChannelMessages: (state, action) => {
      state.channelMessages = action.payload;
    },
    addChannelMessage: (state, action) => {
      state.channelMessages.push(action.payload);
    },
    removeChannelMessage: (state, action) => {
      state.channelMessages = state.channelMessages.filter(
        (msg) => msg._id !== action.payload
      );
    },
    clearChannelMessages: (state) => {
      state.channelMessages = [];
    },
  },
});

// EXPORT ALL ACTIONS
export const {
  setChannelMessages,
  addChannelMessage,
  removeChannelMessage,   // ← MUST BE HERE
  clearChannelMessages,
} = channelMessageSlice.actions;

export default channelMessageSlice.reducer;