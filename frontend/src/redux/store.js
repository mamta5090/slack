import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import messageSlice from "./messageSlice";
import socketSlice from "./SocketSlice";
import conversationSlice from "./conversationSlice"; 
import slackUserSlice from './slackUserSlice'
import workspaceSlice from './workspaceSlice'
import channelSlice from './channelSlice'

const store = configureStore({
  reducer: {
    user: userSlice,
    message: messageSlice,
    socket: socketSlice,
    conversations: conversationSlice, 
    slackUser:slackUserSlice,
    workspace:workspaceSlice,
    channel:channelSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;