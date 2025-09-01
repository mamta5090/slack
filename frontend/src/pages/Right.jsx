import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoIosArrowDown, IoMdMore } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, addMessage } from "../redux/messageSlice";
// A comment explaining the change: Importing fetchConversations to force a UI refresh after marking a thread as read.
import { fetchConversations } from "../redux/conversationSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import Left from "./Left";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

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
      // A comment explaining the change: After successfully marking as read on the backend,
      // we immediately re-fetch the conversation list to update the UI (e.g., remove the "Unread" badge).
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
    if (!id) return;
    (async () => {
      await fetchUser();
      await fetchMessages();
      await markThreadAsRead();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!socket || !user?._id || !id) return;

    // --- START OF MODIFIED CODE ---
    // A comment explaining the change: The listener now expects a 'payload' object, not just a 'msg' object.
    const handleNewMessage = (payload) => {
      const msg = payload.newMessage; // Extract the message from the payload.
      if (!msg) return; // Safety check

      const senderId =
        typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
      const receiverId =
        typeof msg.receiver === "object" ? msg.receiver?._id : msg.receiver;

      const openedUserId = String(id);
      const me = String(user._id);

      const isForThisChat =
        (String(senderId) === openedUserId && String(receiverId) === me) ||
        (String(receiverId) === openedUserId && String(senderId) === me);

      // This logic correctly adds the message to the screen if it's for the open chat and not from the user themselves.
      if (isForThisChat && String(senderId) !== me) {
        dispatch(addMessage(msg));
        // This function now correctly clears the "unread" status from the UI.
        markThreadAsRead();
      }
    };
    // --- END OF MODIFIED CODE ---

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, id, user?._id, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!singleUser) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <div className="fixed top-0 left-0 w-full z-50">
          <Topbar />
        </div>
        <div className="flex flex-1 pt-12">
          <Sidebar />
          <Left />
          <div className="w-[62%] h-[calc(100vh-48px)] flex items-center justify-center">
            <p className="text-gray-500 p-4 text-lg">Select a user to start chatting</p>
          </div>
        </div>
      </div>
    );
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
              disabled={loading || !newMsg.trim()}
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
