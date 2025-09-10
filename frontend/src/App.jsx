import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "axios";

import { setSocket, setOnlineUsers, clearSocket } from "./redux/SocketSlice";
import { setUser } from "./redux/userSlice";
import { upsertConversation } from "./redux/conversationSlice";
import { addMessage } from "./redux/messageSlice";

import Registration from "./component/Registration";
import Login from "./component/Login";
import Home from "./component/Home";
import Right from "./pages/Right";
import MainLayout from "./component/MainLayout";
import VideoRoom from "./pages/VideoRoom";
import Profile from "./ismore/Profile";
import './index.css'

import ProfilePage from "./ismore/ProfilePage";

const SERVER_URL = "http://localhost:5000";

const App = () => {
  const { user } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await axios.get(`${SERVER_URL}/api/user/me`);
          if (res.data?.user) {
            dispatch(setUser(res.data.user));
          } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Authentication check failed", error);
          delete axios.defaults.headers.common["Authorization"];
          localStorage.removeItem("token");
        }
      }
      setAuthChecked(true);
    };
    initAuth();
  }, [dispatch]);


  useEffect(() => {
    if (user) {
      const socketIo = io(SERVER_URL, {
        query: { userId: user._id },
        transports: ['websocket'] 
      });

      dispatch(setSocket(socketIo));

      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      socketIo.on("newMessage", (payload) => {
        if (payload.newMessage) {
          dispatch(addMessage(payload.newMessage));
        }
        if (payload.updatedConversation) {
          dispatch(upsertConversation(payload.updatedConversation));
        }
      });

  
      return () => {
        socketIo.off("getOnlineUsers");
        socketIo.off("newMessage");
        socketIo.close();
        dispatch(clearSocket());
      };
    } else {
      if (socket) {
        socket.close();
        dispatch(clearSocket());
      }
    }

  }, [user, dispatch]);


  if (!authChecked) {
    return null;
  }

  return (
    <Routes>
    
      <Route
    path="/"
    element={user ? <MainLayout /> : <Navigate to="/login" replace />}
  >
    <Route index element={<Home />} />
    <Route path="user/:id" element={<Right/>} />
  </Route>
  <Route
    path="/login"
    element={!user ? <Login /> : <Navigate to="/" replace />}
  />
   <Route
    path="/home"
    element={!user ? <Home /> : <Navigate to="/" replace />}
  />
  <Route
    path="/register"
    element={!user ? <Registration /> : <Navigate to="/" replace />}
  />
   <Route
    path="/room/:roomID"
    element={user ? <VideoRoom /> : <Navigate to="/" replace />}
  />
   {/* <Route
    path="/msg"
    element={user ? <Message/> : <Navigate to="/" replace />}
  /> */}
  <Route
    path="/profilepage"
    element={user ? <ProfilePage/> : <Navigate to="/" replace />}
  />
   <Route
    path="/profile"
    element={user ? <Profile/> : <Navigate to="/" replace />}
  />
    </Routes>
    
  );
};

export default App;