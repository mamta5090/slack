import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoIosArrowDown, IoMdMore } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, addMessage } from "../redux/messageSlice";
const Right = () => {
  const scroll = useRef();
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const { id } = useParams();
  const dispatch = useDispatch();

  const singleUser = useSelector((state) => state.user.singleUser);
  const messages = useSelector((state) => state.message.messages);
  //const socket=useSelector((state)=>state.socket)

  // Fetch single user
  const fetchUser = async () => {
    try {
      const result = await axios.get(`http://localhost:5000/api/user/${id}`, {
        withCredentials: true,
      });
      dispatch(setSingleUser(result.data));
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    setLoading(true);
    try {
      const result = await axios.post(
        `http://localhost:5000/api/message/send/${singleUser._id}`,
        { message: newMsg },
        { withCredentials: true }
      );
      dispatch(addMessage(result.data)); // add new message to Redux
      setNewMsg("");
    } catch (error) {
      console.log("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const result = await axios.get(
        `http://localhost:5000/api/message/getAll/${id}`,
        { withCredentials: true }
      );
      // Ensure it's always an array
      dispatch(setMessages(Array.isArray(result.data) ? result.data : []));
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
      fetchMessages();
    }
    // socket.on("newMessage",(msg)=>{
    //   dispatch(setMessages([...messages,msg]))
    // })
    // return()=>socket?.off("")
  }, [id]);

  // Auto scroll when new messages arrive
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!singleUser) return <p className="text-gray-500 p-4">Loading user...</p>;

  return (
    <div className="w-[62%] h-[calc(100vh-48px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
            {singleUser.name.charAt(0).toUpperCase()}
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
        {messages &&
          messages.map((msg, idx) => (
            <div
              key={idx}
              ref={idx === messages.length - 1 ? scroll : null}
              className={`p-2 rounded-lg max-w-[60%] ${
                msg.senderId === singleUser._id
                  ? "bg-gray-400 text-black self-start"
                  : "bg-purple-600 text-white self-end"
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
          onClick={handleSendMessage}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default Right;
