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
  updateMessage: (state, action) => {
  const updatedMsg = action.payload;
  // This creates a brand new array, which tells React "Something changed!"
  state.messages = state.messages.map(m => 
    m._id === updatedMsg._id ? updatedMsg : m
  );
},
      removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (m) => m._id !== action.payload
      );
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { setMessages, updateMessage,addMessage,removeMessage, clearMessages, setSingleUser } =
  messageSlice.actions;

export default messageSlice.reducer;
