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
    // Prevent duplicates
    const exists = state.messages.find(m => m._id === action.payload._id);
    if (!exists) {
      state.messages.push(action.payload);
    }
  },
  updateMessage: (state, action) => {
  const updatedMsg = action.payload;
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
       incrementReplyCount: (state, action) => {
      const parentId = action.payload;
      const messageIndex = state.messages.findIndex(m => m._id === parentId);
      if (messageIndex !== -1) {
        const msg = state.messages[messageIndex];
        state.messages[messageIndex] = {
          ...msg,
          replyCount: (msg.replyCount || 0) + 1
        };
      }
    },
  },
});

export const { setMessages, updateMessage,addMessage,removeMessage, clearMessages, setSingleUser ,incrementReplyCount } =
  messageSlice.actions;

export default messageSlice.reducer;
