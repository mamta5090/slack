import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoIosArrowDown, IoMdMore } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, addMessage } from "../redux/messageSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import Left from "./Left";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const Right = () => {
  const socket = useSelector((state) => state.socket.socket);
  const scrollRef = useRef(null);
  const listEndRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const { id } = useParams(); // id = other user's id from route
  const dispatch = useDispatch();

  const singleUser = useSelector((state) => state.user.singleUser);
  const user = useSelector((state) => state.user.user);
  const messages = useSelector((state) => state.message.messages);

  // helper to attach auth header from localStorage (consistent with login/register)
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const fetchUser = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${id}`, {
        headers: authHeaders(),
      });
      dispatch(setSingleUser(res.data));
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  const fetchMessages = async () => {
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
      const res = await axios.post(
        `http://localhost:5000/api/message/send/${singleUser._id}`,
        { message: newMsg },
        { headers: authHeaders() }
      );
      // append immediately (sender side)
      dispatch(addMessage(res.data));
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch user + message history when thread changes
  useEffect(() => {
    if (id) {
      fetchUser();
      fetchMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // live updates: listen for "newMessage" from socket and add it if it belongs to this chat
  useEffect(() => {
    if (!socket || !user?._id || !id) return;

    const handleNewMessage = (msg) => {
      const senderId =
        typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
      const receiverId =
        typeof msg.receiver === "object" ? msg.receiver?._id : msg.receiver;

      const openedUserId = String(id);
      const me = String(user._id);

      const isForThisChat =
        (String(senderId) === openedUserId && String(receiverId) === me) ||
        (String(receiverId) === openedUserId && String(senderId) === me);

      if (isForThisChat) {
        dispatch(addMessage(msg));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, id, user?._id, dispatch]);

  // auto-scroll to latest message whenever messages change
  useEffect(() => {
    // scroll into view of the last item
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!singleUser) {
    return <p className="text-gray-500 p-4">Loading user...</p>;
  }

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="fixed top-0 left-0 w-full z-50">
        <Topbar />
      </div>

      <div className="flex flex-1 pt-12">
        <Sidebar />
        <Left />

        <div className="w-[62%] h-[calc(100vh-48px)] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
                {singleUser.name?.charAt(0)?.toUpperCase()}
              </div>
              <p className="font-semibold">{singleUser.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 border border-gray-400 rounded-xl px-2 py-1 cursor-pointer">
                <CiHeadphones />
                <IoIosArrowDown />
              </div>
              <IoMdMore className="cursor-pointer" />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {messages?.map((msg, idx) => {
              const senderId =
                typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
              const isMine = String(senderId) === String(user._id);

              return isMine ? (
                <SenderMessage
                  key={msg._id || idx}
                  message={msg.message}
                  createdAt={msg.createdAt}
                />
              ) : (
                <ReceiverMessage
                  key={msg._id || idx}
                  message={msg.message}
                  createdAt={msg.createdAt}
                />
              );
            })}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-300 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) handleSendMessage(e);
              }}
              className="flex-1 p-2 rounded-lg border border-gray-400 focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Right;          