import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import axios from "axios";

import { setSocket, setOnlineUsers, clearSocket } from "./redux/SocketSlice";
import { setUser } from "./redux/userSlice";
import { upsertConversation, fetchConversations } from "./redux/conversationSlice";
import { addMessage } from "./redux/messageSlice";
import { setAllChannels } from "./redux/channelSlice";
import Registration from "./component/Registration";
import Login from "./component/Login";
import Home from "./component/Home";
import Right from "./pages/Right";
import Channel from "./pages/Channel";
import WelcomeScreen from "./pages/WelcomeScreen";
import "./index.css";
import Signin from "./slack/Signin";
import ProfilePage from "./component/profile/ProfilePage.jsx";
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
import {serverURL} from './main.jsx'
import {addNotification} from './redux/notification.js'
import { setNotifications as setNotificationsAction, addNotification as addNotificationAction } from "./redux/notification.js";
import NotificationToast from "./component/NotificationToast";


const App = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);
const [notifications, setNotifications] = useState([]);

   const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

 
useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const res = await axios.get(`${serverURL}/api/slack/me`);
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
  if (user?._id) {
    const socketIo = io(serverURL, {
      query: { userId: user._id },
      transports: ["websocket"],
    });

    dispatch(setSocket(socketIo));

   const fetchAndStoreNotifications = async () => {
        try {
          const res = await axios.get(`${serverURL}/api/notification/user/notifications`, { withCredentials: true });
          const notifications = res.data?.notifications || [];
          const normalized = notifications.map(n => ({
            id: n._id || n.id,
            type: n.type,
            title: n.title,
            text: n.body || n.text || "",
            data: n.data || {},
            createdAt: n.createdAt || n.created_at,
            isRead: !!n.isRead,
            actor: n.actorId || n.actor,
          }));
          dispatch(setNotificationsAction(normalized));
        } catch (err) {
          console.error("Failed to fetch notifications:", err);
        }
      };

      const refreshConversationsAndChannels = async () => {
        try {
          dispatch(fetchConversations());
          const channelsRes = await axios.get(`${serverURL}/api/channel/getAllChannel`, { withCredentials: true });
          if (channelsRes.data) {
            dispatch(setAllChannels(channelsRes.data));
          }
        } catch (err) {
          console.error("Failed to refresh conversations/channels:", err);
        }
      };

    socketIo.on("connect", () => {
      console.log("socket connected:", socketIo.id);
      socketIo.emit("register", user._id);
      fetchAndStoreNotifications();
      refreshConversationsAndChannels();
    });

    // also on reconnect (socket.io sometimes emits 'reconnect')
    socketIo.on("reconnect", () => {
      console.log("socket reconnected");
      socketIo.emit("register", user._id);
      fetchAndStoreNotifications();
      refreshConversationsAndChannels();
    });

    // Listen for refreshData event from backend after register
    socketIo.on("refreshData", () => {
      console.log("📡 Received refreshData event - updating conversations and channels");
      refreshConversationsAndChannels();
    });

    socketIo.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    // Incoming popup for channels
    socketIo.on("channelNotification", (data) => {
      console.log("🔔 Popup Event Received:", data);

      // convert to notification slice shape
      const note = {
        id: data.notificationId || Date.now(),
        title: `New message in #${data.channelName}`,
        text: data.message,
        data: { channelId: data.channelId, ...data.data },
        createdAt: data.timestamp || new Date().toISOString(),
        isRead: false,
        actor: { name: data.sender }
      };

      // always add to redux list (this covers online & queued notifications in UI)
      dispatch(addNotificationAction(note));

      // show toast only if not currently on that channel route
      const currentPath = window.location.pathname;
      if (!currentPath.includes(data.channelId)) {
        setNotifications(prev => {
          // local state used for the <NotificationToast /> popup
          const newNote = { id: note.id, sender: data.sender, channelName: data.channelName, message: data.message };
          return [newNote, ...prev];
        });
        // auto-remove local toast after 5s (you already had this behavior)
        setTimeout(() => removeNotification(note.id), 5001);
      }
    });

    // Generic notifications (personal or other channels) — push to redux
    socketIo.on("notification", (notificationPayload) => {
      // backend may send the full notification document
      const note = {
        id: notificationPayload._id || notificationPayload.id || Date.now(),
        title: notificationPayload.title || notificationPayload.text,
        text: notificationPayload.body || notificationPayload.text || "",
        data: notificationPayload.data || {},
        isRead: !!notificationPayload.isRead,
        createdAt: notificationPayload.createdAt || new Date().toISOString(),
        actor: notificationPayload.actorId || notificationPayload.actor,
      };
      dispatch(addNotificationAction(note));
    });

    // existing listeners
    socketIo.on("call-error", (payload) => {
      console.warn("call-error", payload);
    });

   socketIo.on("newMessage", (payload) => {
        const { newMessage, updatedConversation } = payload;

        if (newMessage) {
          dispatch(addMessage(newMessage));
        }

        if (updatedConversation) {
          // 1. Check if the user is currently viewing this chat
          // We assume the URL structure is /dm/<User_ID>
          const currentPath = window.location.pathname;
          
          // Get the sender's ID (the person talking to us)
          const senderId = newMessage?.sender?._id || newMessage?.sender;

          // Check if we are on the page of the person sending the message
          const isViewingChat = currentPath.includes(`/dm/${senderId}`);

          if (isViewingChat && updatedConversation.unreadCounts) {
             console.log("👀 User is viewing chat, forcing unread count to 0 in Redux update");
             // Force the count to 0 locally before saving to Redux
             // This prevents the "1" from ever flashing on the screen
             updatedConversation.unreadCounts[user._id] = 0;
          }

          dispatch(upsertConversation(updatedConversation));
        }
      });

    socketIo.on("newChannelMessage", (newMessage) => {
      console.log("Global listener received channel message:", newMessage);
    });

    // cleanup
    return () => {
      socketIo.off("connect");
      socketIo.off("reconnect");
      socketIo.off("getOnlineUsers");
      socketIo.off("newMessage");
      socketIo.off("call-error");
      socketIo.off("newChannelMessage");
      socketIo.off("channelNotification");
      socketIo.off("notification");
      socketIo.off("refreshData");
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
    <>
     {notifications.length > 0 && (
        <NotificationToast 
          notifications={notifications} 
          removeNotification={removeNotification} 
        />
      )}
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
      {/* <Route
        path="/room/:roomID"
        element={user ? <VideoRoom /> : <Navigate to="/login" replace />}
      /> */}
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
    </>
  );
};

export default App;