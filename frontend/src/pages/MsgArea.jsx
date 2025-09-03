import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { CiHeadphones } from "react-icons/ci";
import { IoMdMore } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSingleUser } from "../redux/userSlice";
import { setMessages, clearMessages } from "../redux/messageSlice";
import { fetchConversations } from "../redux/conversationSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import Home from '../component/Home';
import { format } from 'date-fns';

const MsgRight = () => {
 
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const listEndRef = useRef(null); 


  const [loading, setLoading] = useState(false); 
  const [newMsg, setNewMsg] = useState(""); 

 
  const singleUser = useSelector((state) => state.user.singleUser); 
  const user = useSelector((state) => state.user.user); 
  const allMessages = useSelector((state) => state.message.messages);


  const messages = React.useMemo(() => {
    if (!user?._id || !id) return [];
    return allMessages.filter(
      (msg) =>
        (String(msg.sender?._id) === String(user._id) && String(msg.receiver) === String(id)) ||
        (String(msg.sender?._id) === String(id) && String(msg.receiver) === String(user._id))
    );
  }, [allMessages, user?._id, id]);

 
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };


  const fetchUser = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/user/${id}`, authHeaders());
      dispatch(setSingleUser(res.data));
    } catch (error) {
      console.error("Error fetching single user:", error);
      dispatch(setSingleUser(null));
    }
  };

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/message/getAll/${id}`, authHeaders());
      dispatch(setMessages(Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const markThreadAsRead = async () => {
    if (!id) return;
    try {
      await axios.post(`http://localhost:5000/api/conversation/read/${id}`, {}, authHeaders());
      dispatch(fetchConversations());
    } catch (error) {
      console.error("Failed to mark thread as read", error);
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
        authHeaders()
      );
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Video Call Handler ---
  const handleJoinVideoCall = () => {
    // Ensure both user IDs are available
    if (!user?._id || !singleUser?._id) {
      console.error("Cannot start video call: User information is missing.");
      return;
    }
    // Create a unique, consistent room ID by combining the two user IDs.
    // Sorting them ensures both users will generate the same ID regardless of who starts the call.
    const roomID = [user._id, singleUser._id].sort().join('_');

    // Navigate to the video room URL with the generated room ID
    navigate(`/room/${roomID}`);
  };

  // --- useEffect Hooks ---
  // This effect runs whenever the user clicks on a different chat (i.e., the 'id' in the URL changes)
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


 
  if (!singleUser) {
    return <Home />;
  }
  
 
  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
   
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="absolute top-12 left-[332px] w-[calc(100vw-332px)] h-[calc(100vh-3rem)] flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
            {singleUser.name?.charAt(0)?.toUpperCase()}
          </div>
          <p className="font-semibold">{singleUser.name}</p>
        </div>
        <div className="flex items-center gap-4 text-xl text-gray-600">
          <CiHeadphones 
            className="cursor-pointer hover:text-purple-600 transition-colors" 
            onClick={handleJoinVideoCall} 
          />
          <IoMdMore className="cursor-pointer" />
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1">
        {messages.map((msg, idx) => {
          const isMine = String(msg.sender?._id) === String(user._id);
          const formattedTime = formatTimestamp(msg.createdAt);

          return isMine ? (
            <SenderMessage key={msg._id || idx} message={msg.message} createdAt={formattedTime} />
          ) : (
            <ReceiverMessage key={msg._id || idx} message={msg.message} createdAt={formattedTime} />
          );
        })}
        {/* Invisible element to which we scroll */}
        <div ref={listEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder={`Message ${singleUser?.name}`}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
};

export default MsgRight;