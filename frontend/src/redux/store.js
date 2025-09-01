// PREVIOUS CODE
/*
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import messageSlice from "./messageSlice";
import socketSlice from "./SocketSlice";

const store = configureStore({
  reducer: {
    user: userSlice,
    message: messageSlice,
    socket: socketSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
*/

// MODIFIED CODE
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import messageSlice from "./messageSlice";
import socketSlice from "./SocketSlice";
import conversationSlice from "./conversationSlice"; // A comment explaining the change: Import the new slice.

const store = configureStore({
  reducer: {
    user: userSlice,
    message: messageSlice,
    socket: socketSlice,
    conversations: conversationSlice, // A comment explaining the change: Add the new slice to the store's reducer.
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;