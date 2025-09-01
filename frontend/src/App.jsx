import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "axios";

import { setSocket, setOnlineUsers, clearSocket } from "./redux/SocketSlice";
import { setUser } from "./redux/userSlice";
// A comment explaining the change: Importing the new action for real-time updates.
import { upsertConversation } from "./redux/conversationSlice";

import Registration from "./component/Registration";
import Login from "./component/Login";
import Home from "./component/Home";
import Right from "./pages/Right";

const SERVER_URL = "http://localhost:5000";

const App = () => {
  const user = useSelector((state) => state.user.user);
  const socket = useSelector((state) => state.socket.socket);
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await axios.get("http://localhost:5000/api/user/me");
          if (res.data?.user) {
            dispatch(setUser(res.data.user));
          } else {
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
          }
        } catch {
          delete axios.defaults.headers.common["Authorization"];
          localStorage.removeItem("token");
        }
      } else {
        delete axios.defaults.headers.common["Authorization"];
      }
      setAuthChecked(true);
    };
    initAuth();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const socketIo = io(SERVER_URL, {
        query: { userId: user._id },
      });
      dispatch(setSocket(socketIo));

      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      // --- START OF MODIFIED CODE ---
      // A comment explaining the change: This listener now dispatches an action to update the Redux store directly,
      // which is faster and avoids the race condition of re-fetching from the API.
      socketIo.on("newMessage", (payload) => {
        if (payload.updatedConversation) {
          dispatch(upsertConversation(payload.updatedConversation));
        }
      });
      // --- END OF MODIFIED CODE ---

      return () => {
        socketIo.close();
        dispatch(clearSocket());
      };
    } else {
      if (socket) {
        socket.close();
        dispatch(clearSocket());
      }
    }
  }, [user, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!authChecked) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Registration /> : <Navigate to="/" replace />}
      />
      <Route
        path="/user/:id"
        element={user ? <Right /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/msg"
        element={user ? <Right /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;