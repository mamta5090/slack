import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import messageSlice from "./messageSlice";
import socketSlice from "./SocketSlice";
import conversationSlice from "./conversationSlice"; 
import slackUserSlice from './slackUserSlice'
import workspaceSlice from './workspaceSlice'

const store = configureStore({
  reducer: {
    user: userSlice,
    message: messageSlice,
    socket: socketSlice,
    conversations: conversationSlice, 
    slackUser:slackUserSlice,
    workspace:workspaceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;