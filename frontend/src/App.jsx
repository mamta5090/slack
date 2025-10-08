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
import Dms from "./component/sidebar/Dms";
import Later from "./component/sidebar/Later";
import HomePage from "./component/Home";
import Files from "./component/sidebar/Files";
import More from "./component/sidebar/More";
import Avtivity from "./component/sidebar/Activity";
import Left from "./pages/Left";


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
    return null; 
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <MainLayout /> : <SlackLogin />}
      >
        {user && (
          <>
            <Route index element={<Home />} />
            <Route path="user/:id" element={
              <div className="w-full h-full flex flex-row">
                <Left />   
                <Right />  
              </div>
            } />
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
        path="/activity"
        element={user ? <Avtivity /> : <Navigate to="/login" replace />}
      />
        <Route
        path="/dms"
        element={user ? <Dms /> : <Navigate to="/login" replace />}
      />
        <Route
        path="/files"
        element={user ? <Files/> : <Navigate to="/login" replace />}
      />
        <Route
        path="/later"
        element={user ? <Later /> : <Navigate to="/login" replace />}
      />
        <Route
        path="/more"
        element={user ? <More /> : <Navigate to="/login" replace />}
      />
        <Route
        path="/homepage"
        element={user ? <HomePage /> : <Navigate to="/login" replace />}
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
