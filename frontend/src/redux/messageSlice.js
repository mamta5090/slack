import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],  
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setSingleUser: (state, action) => {
      state.singleUser = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearMessages, setSingleUser } =
  messageSlice.actions;

export default messageSlice.reducer;
