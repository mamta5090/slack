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
import Channel from "./pages/Channel";
import WelcomeScreen from "./pages/WelcomeScreen";
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
import HomeSidebar from "./component/sidebar/HomePageSidebar";
import HomeRight from "./pages/HomeRight";
import { setIncomingCall } from "./redux/callSlice";


const SERVER_URL = "http://localhost:5000";

const App = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
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
    if (user?._id) {
      const socketIo = io(SERVER_URL, {
        query: { userId: user._id },
        transports: ["websocket"],
      });

      dispatch(setSocket(socketIo));

      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

       socketIo.on("call-error", (payload) => {
      console.warn("call-error", payload);
      // show toast or UI notification
    });

      socketIo.on("newMessage", (payload) => {
        if (payload.newMessage) {
          dispatch(addMessage(payload.newMessage));
        }
        if (payload.updatedConversation) {
          dispatch(upsertConversation(payload.updatedConversation));
        }
      });
      
      // FIX #3: Attach this listener to the 'socketIo' instance.
      socketIo.on("newChannelMessage", (newMessage) => {
        console.log("Global listener received channel message:", newMessage);
      });

      // Cleanup function to run when the user logs out or the component unmounts.
      return () => {
        socketIo.off("getOnlineUsers");
        socketIo.off("newMessage");
         socketIo.off("call-error");
        socketIo.off("newChannelMessage");
        socketIo.disconnect();
        dispatch(clearSocket());
      };
    }
  }, [user, dispatch, navigate]);

   if (!authChecked) {
    // Render a simple loading state to avoid flashes of content
    return <div style={{ width: '100vw', height: '100vh', backgroundColor: '#121212' }} />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" replace />}
      >
       
        <Route index element={<WelcomeScreen />} />
        <Route path="dm/:id" element={<HomeRight />} />
        <Route path="channel/:channelId" element={<Channel />} />
        <Route path="files" element={<Files />} />
      </Route>

  
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <Registration /> : <Navigate to="/" replace />} />
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
        path="/dms/:id"
        element={user ? <Dms /> : <Navigate to="/login" replace />}
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
      <Route path="/slacklogin" element={<SlackLogin />} />
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