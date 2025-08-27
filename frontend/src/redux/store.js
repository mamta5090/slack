import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice'
import messageSlice from './messageSlice'
import socketSlice from './SocketSlice'

const store=configureStore({
    reducer:{
        user:userSlice,
        message:messageSlice,
        socket:socketSlice,
    },
});

export default store; 