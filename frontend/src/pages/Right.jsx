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
  const scroll = useRef();
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const { id } = useParams();
  const dispatch = useDispatch();

  const singleUser = useSelector((state) => state.user.singleUser);
  const user = useSelector((state) => state.user.user);
  const messages = useSelector((state) => state.message.messages);
  //const socket=useSelector((state)=>state.socket)

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
      dispatch(addMessage(result.data)); 
      setNewMsg("");
    } catch (error) {
      console.log("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const result = await axios.get(
        `http://localhost:5000/api/message/getAll/${id}`,
        { withCredentials: true }
      );
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
    //  socket.on("newMessage", (msg) => {
    //   dispatch(addMessage(msg));
    // });

    // return () => socket.off("newMessage");
  }, [id]);

  // Auto scroll when new messages arrive
  // useEffect(() => {
  //   if (scroll.current) {
  //     scroll.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // }, [messages]);

  if (!singleUser) return <p className="text-gray-500 p-4">Loading user...</p>;

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
              messages.map((msg, idx) =>
                msg.senderId === user._id ? (
                  <SenderMessage
                    key={idx}
                    message={msg.message}
                    //time={msg.time}
                    ref={idx === messages.length - 1 ? scroll : null}
                  />
                ) : (
                  <ReceiverMessage
                    key={idx}
                    message={msg.message}
                    // time={msg.time}
                    ref={idx === messages.length - 1 ? scroll : null}
                  />
                )
              )}
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
      </div>
    </div>
  );
};

export default Right;
