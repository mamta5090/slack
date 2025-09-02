import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoIosArrowDown, IoMdMore } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, addMessage } from "../redux/messageSlice";
import { fetchConversations } from "../redux/conversationSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import Home from "../component/Home";

const Right = () => {
  const socket = useSelector((state) => state.socket.socket);
  const listEndRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const { id } = useParams();
  const dispatch = useDispatch();

  const singleUser = useSelector((state) => state.user.singleUser);
  const user = useSelector((state) => state.user.user);
  const messages = useSelector((state) => state.message.messages);

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token
      ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      : { "Content-Type": "application/json" };
  };

  const markThreadAsRead = async () => {
    if (!id) return;
    try {
      await axios.post(
        `http://localhost:5000/api/conversation/read/${id}`,
        {},
        { headers: authHeaders() }
      );
      dispatch(fetchConversations());
    } catch {
      // ignore errors
    }
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
      dispatch(addMessage(res.data));
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      (async () => {
        await fetchUser();
        await fetchMessages();
        await markThreadAsRead();
      })();
    } else {
      dispatch(setSingleUser(null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!socket || !user?._id || !id) return;

    const handleNewMessage = (payload) => {
      const msg = payload.newMessage;
      if (!msg) return;

      const senderId =
        typeof msg.sender === "object" ? msg.sender?._id : msg.sender;

      if (String(senderId) === id && String(senderId) !== user._id) {
        dispatch(addMessage(msg));
        markThreadAsRead();
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, id, user?._id, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!singleUser) {
    return <Home />;
  }

  return (
    // A comment explaining the change: The main container takes the full height of the space provided by MainLayout.
    <div className="absolute top-12 left-[332px] w-[calc(100vw-332px)] h-[calc(100vh-3rem)] flex flex-col bg-white">
      {/* Header (flex-shrink-0 prevents it from shrinking) */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
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

      {/* Messages List */}
      {/* A comment explaining the change: 'flex-1' makes this container take up all available vertical space,
          and 'overflow-y-auto' ensures that only this container scrolls. */}
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
        <div ref={listEndRef} />
      </div>

      {/* Input (flex-shrink-0 prevents it from shrinking) */}
      <div className="flex-shrink-0 p-4 border-t border-gray-300 flex gap-2">
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
          disabled={loading || !newMsg.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Right;
