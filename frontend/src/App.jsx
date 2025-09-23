import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import "./index.css";
import Signin from "./slack/Signin";

import ProfilePage from "./ismore/ProfilePage";
import Invite from "./component/koalaliving/Invite";
import SlackLogin from "./slack/SlackLogin";
import ConfirmEmail from "./slack/ConfirmEmail";
import LaunchWorkspace from "./slack/LaunchWorkspace";
import NameStep from "./slack/NameStep";
import Company from "./slack/Company";
import Team from "./slack/Team";
import SlackPro from "./slack/SlackPro";
import Welcome from "./slack/Welcome";
import Workspace from "./slack/Workspace";

const SERVER_URL = "http://localhost:5000";

const App = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const [authChecked, setAuthChecked] = useState(false);

  // 🔹 Auth check
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await axios.get(`${SERVER_URL}/api/slack/me`);
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

  // 🔹 Socket setup
  useEffect(() => {
    if (user) {
      const socketIo = io(SERVER_URL, {
        query: { userId: user._id },
        transports: ["websocket"],
      });

      dispatch(setSocket(socketIo));

      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      socketIo.on("incoming-call", async (payload) => {
        try {
          const caller = payload.from || {};
          const roomID = payload.roomID;
          const accept = window.confirm(
            `${caller.name || "Someone"} is calling you. Accept?`
          );

          socketIo.emit("answer-call", {
            to: caller.id,
            accepted: accept === true,
            roomID,
          });

          if (accept) {
            navigate(`/room/${roomID}`);
          }
        } catch (err) {
          console.error("incoming-call handler error:", err);
        }
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
    return null; // wait until auth check is complete
  }

  return (
    <Routes>
      {/* Default route → SlackLogin if not logged in, else → MainLayout */}
      <Route
        path="/"
        element={user ? <MainLayout /> : <SlackLogin />}
      >
        {user && (
          <>
            <Route index element={<Home />} />
            <Route path="user/:id" element={<Right />} />
          </>
        )}
      </Route>

      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Registration /> : <Navigate to="/" replace />}
      />
      <Route
        path="/room/:roomID"
        element={user ? <VideoRoom /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profilepage"
        element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={user ? <Profile /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/invite"
        element={user ? <Invite /> : <Navigate to="/login" replace />}
      />

     
      <Route path="/signin" element={<Signin />} />
      <Route path="/email" element={<ConfirmEmail />} />
      <Route path="/launchworkspace" element={<LaunchWorkspace />} />
      <Route path="/namestep" element={<NameStep />} />
      <Route path="/company" element={<Company />} />
      <Route path="/team" element={<Team />} />
      <Route path="/slackpro" element={<SlackPro />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/workspace" element={<Workspace />} />
    </Routes>
  );
};

export default App;
