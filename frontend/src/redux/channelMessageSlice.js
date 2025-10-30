import { createSlice } from "@reduxjs/toolkit";


// In src/redux/channelMessageSlice.js

const initialState = {
  channelMessages: [], // <-- FIX TYPO HERE
};

const channelMessageSlice = createSlice({
  name: "channelMessage",
  initialState,
  reducers: {
    setChannelMessages: (state, action) => {
      state.channelMessages = action.payload; // <-- AND HERE
    },
    addChannelMessage: (state, action) => {
 if (!state.channelMessages.find(msg => msg._id === action.payload._id)) { // <-- AND HERE
        state.channelMessages.push(action.payload); // <-- AND HERE
      }
    },
    clearChannelMessages: (state) => {
      state.channelMessages = []; // <-- AND HERE
    },
  },
});

export const {setChannelMessages,addChannelMessage,clearChannelMessages}=channelMessageSlice.actions
export default channelMessageSlice.reducer;