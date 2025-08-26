import axios from "axios";
import React, { useEffect, useState } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdMore } from "react-icons/io";
import { useParams } from "react-router-dom";

const Right = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const { id } = useParams(); // ✅ receiverId comes from URL

  // use your backend URL
  const API = "http://localhost:5000"; 

  const fetchUser = async () => {
    try {
      const result = await axios.get(`${API}/api/user/${id}`, {
        withCredentials: true,
      });
      setUser(result.data);
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  const sendMessage = async () => {
    setLoading(true);
    if (!newMsg.trim()) return;

    try {
      const result = await axios.post(
        `${API}/api/message/send/${id}`, // ✅ fixed to 5000
        { message: newMsg },
        { withCredentials: true }
      );

      setMessages((prev) => [...prev, result.data]);
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const result = await axios.get(`${API}/api/message/getmessage/${id}`, {
        withCredentials: true,
      });
      setMessages(result.data);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchMessages();
    }
  }, [id]);

  if (!user) return <p className="text-gray-500 p-4">Loading user...</p>;

  return (
    <div className="w-[62%] h-[calc(100vh-48px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <p className="font-semibold">{user.name}</p>
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
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-[60%] ${
              msg.senderId === user._id
                ? "bg-gray-300 self-start"
                : "bg-purple-500 text-white self-end ml-auto"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-300 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          className="flex-1 p-2 rounded-lg border border-gray-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Right;
