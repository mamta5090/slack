import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoIosArrowDown, IoMdMore } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, clearMessages } from "../redux/messageSlice";
import { fetchConversations } from "../redux/conversationSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import Home from '../component/Home';
import { format } from 'date-fns';

const Right = () => {
  const listEndRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const { id } = useParams();
  const dispatch = useDispatch();

  const singleUser = useSelector((state) => state.user.singleUser);
  const user = useSelector((state) => state.user.user);
  const allMessages = useSelector((state) => state.message.messages);

  // This filtering logic is fine, but it was moved from the top level
  const messages = allMessages.filter(
    (msg) =>
      (String(msg.sender._id || msg.sender) === String(user?._id) && String(msg.receiver) === String(id)) ||
      (String(msg.sender._id || msg.sender) === String(id) && String(msg.receiver) === String(user?._id))
  );

  // --- FIX 1: Implement the auth header function ---
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  // --- FIX 2: Implement the function to mark messages as read ---
  const markThreadAsRead = async () => {
    if (!id) return;
    try {
      await axios.post(
        `http://localhost:5000/api/conversation/read/${id}`,
        {}, // No body needed for this request
        { headers: authHeaders() }
      );
      // Refresh conversations to update unread counts in the left panel
      dispatch(fetchConversations());
    } catch (error) {
      console.error("Failed to mark thread as read", error);
    }
  };

  // --- FIX 3: Implement the function to fetch the other user's data ---
 // In src/pages/Right.jsx

const fetchUser = async () => {
  if (!id) return;
  try {
    // --- FIX: Corrected the API endpoint URL ---
    const res = await axios.get(
      `http://localhost:5000/api/user/${id}`, // Ensure "/get" is removed
      { headers: authHeaders() }
    );
    dispatch(setSingleUser(res.data));
  } catch (error) {
    console.error("Error fetching single user:", error);
    dispatch(setSingleUser(null));
  }
};

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/message/getAll/${id}`,
        { headers: authHeaders() }
      );
      dispatch(setMessages(Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !singleUser?._id) return;
    setLoading(true);
    try {
      await axios.post(
        `http://localhost:5000/api/message/send/${singleUser._id}`,
        { message: newMsg },
        { headers: authHeaders() }
      );
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(clearMessages());
      fetchUser();
      fetchMessages();
      markThreadAsRead();
    } else {
      dispatch(setSingleUser(null));
    }
  }, [id, dispatch]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // This check is the reason you see the <Home/> component
  if (!singleUser) {
    return <Home />;
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    return format(new Date(isoString), "PPpp");
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <div className="font-bold text-lg">{singleUser?.name}</div>
          <IoIosArrowDown />
        </div>
        <div className="flex items-center gap-4 text-xl text-gray-600">
          <CiHeadphones className="cursor-pointer" />
          <IoMdMore className="cursor-pointer" />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages?.map((msg, idx) => {
          const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
          const isMine = String(senderId) === String(user._id);
          const formattedTime = formatTimestamp(msg.createdAt);

          return isMine ? (
            <SenderMessage
              key={msg._id || idx}
              message={msg.message}
              createdAt={formattedTime}
            />
          ) : (
            <ReceiverMessage
              key={msg._id || idx}
              message={msg.message}
              createdAt={formattedTime}
            />
          );
        })}
        <div ref={listEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder={`Message #${singleUser?.name}`}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default Right;