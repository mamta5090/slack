import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "axios";

// Redux Actions
import { setSocket, setOnlineUsers, clearSocket } from "./redux/SocketSlice";
import { setUser } from "./redux/userSlice";
import { upsertConversation } from "./redux/conversationSlice";
import { addMessage } from "./redux/messageSlice";

// Components and Pages
import Registration from "./component/Registration";
import Login from "./component/Login";
import Home from "./component/Home";
import Right from "./pages/Right";
import MainLayout from "./component/MainLayout";

// Define the server URL in one place
const SERVER_URL = "http://localhost:5000";

const App = () => {
  const { user } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  // State to ensure we check for auth token before rendering any routes
  const [authChecked, setAuthChecked] = useState(false);

  // Effect for checking authentication on initial app load
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
            // Token is invalid, so clear it
            delete axios.defaults.headers.common["Authorization"];
            localStorage.removeItem("token");
          }
        } catch (error) {
          // Any error (e.g., network, expired token) should result in logout
          console.error("Authentication check failed", error);
          delete axios.defaults.headers.common["Authorization"];
          localStorage.removeItem("token");
        }
      }
      // Mark authentication as checked so the app can render
      setAuthChecked(true);
    };

    initAuth();
  }, [dispatch]);

  // Effect for managing the Socket.io connection
  useEffect(() => {
    // Only connect if there is a logged-in user
    if (user) {
      const socketIo = io(SERVER_URL, {
        query: { userId: user._id },
        transports: ['websocket'] // Best for real-time performance
      });

      dispatch(setSocket(socketIo));

      // Listen for the list of online users
      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      // Global listener for new messages
      socketIo.on("newMessage", (payload) => {
        // Add the message to the message list in Redux
        if (payload.newMessage) {
          dispatch(addMessage(payload.newMessage));
        }
        // Update the conversation list (for unread counts, etc.)
        if (payload.updatedConversation) {
          dispatch(upsertConversation(payload.updatedConversation));
        }
      });

      // Cleanup on component unmount or when user logs out
      return () => {
        socketIo.off("getOnlineUsers");
        socketIo.off("newMessage");
        socketIo.close();
        dispatch(clearSocket());
      };
    } else {
      // If there is no user but a socket exists, disconnect it
      if (socket) {
        socket.close();
        dispatch(clearSocket());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dispatch]);

  // Avoid rendering anything until the initial authentication check is complete
  if (!authChecked) {
    return null; // Or a loading spinner component
  }

  return (
    <Routes>
      {/* Protected Routes: These require a logged-in user */}
      <Route
        path="/"
        element={user ? <MainLayout /> : <Navigate to="/login" replace />}
      >
        {/* The default page shown at "/" */}
        <Route index element={<Home />} />
        {/* The chat page, which depends on a user ID in the URL */}
        <Route path="user/:id" element={<Right />} />
      </Route>

      {/* Public Routes: Login and Registration */}
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Registration /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default App;