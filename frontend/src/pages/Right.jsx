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
import { FiBold, FiItalic } from "react-icons/fi";
import { FaStrikethrough } from "react-icons/fa6";
import { GoLink, GoQuote } from "react-icons/go";
import { AiOutlineOrderedList } from "react-icons/ai";
import { FaListUl, FaCode } from "react-icons/fa6";
import { RiCodeBlock, RiArrowDropDownLine } from "react-icons/ri";
import { CiCirclePlus, CiVideoOn } from "react-icons/ci";
import { BsEmojiSmile } from "react-icons/bs";
import { AiTwotoneAudio } from "react-icons/ai";
import { CgShortcut } from "react-icons/cg";
import { IoSend } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
  import { FiMessageCircle } from "react-icons/fi";
  import { MdOutlinePlaylistAdd } from "react-icons/md";

const Right = () => {
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

  // new send function (can be called from form submit, Enter, or click)
  const sendMessage = async () => {
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

  // helper to create consistent room id
  const makeRoomId = (a, b) => [a, b].sort().join('_');

  const handleJoinVideoCall = () => {
    if (!user?._id || !singleUser?._id) {
      console.error("Cannot start video call: User information is missing.");
      return;
    }
    const roomID = makeRoomId(user._id, singleUser._id);
    navigate(`/room/${roomID}`);
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

  if (!singleUser) {
    return <Home />;
  }

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // handle Enter (send) vs Shift+Enter (newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed absolute top-12 right-[0px] w-[calc(100vw-332px)] h-[calc(100vh-3rem)] flex flex-col bg-white ">
      {/* Header */}
      <div className="flex-row flex items-center justify-between px-4 py-2 ">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
            {singleUser.name?.charAt(0)?.toUpperCase()}
          </div>
          <p className="font-semibold">{singleUser.name}</p>
        </div>

        <div className="flex items-center gap-4 text-xl text-gray-600">
        <div className="flex flex-row border rounded-xl p-1">
 <div className="hover:bg-[#f3f4f6]  ">
   <CiHeadphones
            className="cursor-pointer hover:text-purple-600 transition-colors"
            onClick={handleJoinVideoCall}
          />
 </div>

 <div  className="hover:bg-[#f3f4f6]  ">
 <RiArrowDropDownLine className="text-2xl" />
 </div>
 
        </div>
          <IoMdMore className="cursor-pointer" />

          <div>
<RxCross1 className="cursor-pointer"/>
          </div>
        </div>

        
        
      </div>

      <div className="border-b border-gray-300 flex flex-row gap-[30px] px-[15px] pb-[10px]">
<div className="flex flex-row items-center gap-[5px] font-semibold">
  <FiMessageCircle />

<p className="">Message</p>
</div>
<div className="flex flex-row items-center gap-[5px] font-semibold">
<MdOutlinePlaylistAdd />
<p>Add canvas</p></div>
<div className="font-semibold">
  <div>+</div>
</div>
      </div>


    
      <div className="flex-1 p-4 overflow-y-auto space-y-1">
        {messages.map((msg, idx) => {
          const isMine = String(msg.sender?._id) === String(user._id);
          const formattedTime = formatTimestamp(msg.createdAt);

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
              user={msg.sender} 
            />
          );
        })}
        <div ref={listEndRef} />
      </div>


      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white ">
       
        <div className="flex flex-row items-center gap-5 bg-[#f3f4f6] px-3 py-2 rounded-t-lg">
          <FiBold className="cursor-pointer" />
          <FiItalic className="cursor-pointer" />
          <FaStrikethrough className="cursor-pointer" />
          <GoLink className="cursor-pointer" />
          <AiOutlineOrderedList className="cursor-pointer" />
          <FaListUl className="cursor-pointer" />
          <GoQuote className="cursor-pointer" />
          <FaCode className="cursor-pointer" />
          <RiCodeBlock className="cursor-pointer" />
        </div>

    
       <div className="border border-gray-200 rounded-b-lg">
  <form
    onSubmit={(e) => {
      e.preventDefault();
      sendMessage();
    }}
    className="relative"
  >
    <textarea
      value={newMsg}
      onChange={(e) => setNewMsg(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={`Message ${singleUser?.name}`}
      className="w-full p-3 min-h-[48px] outline-none"
      disabled={loading}
      aria-label={`Message ${singleUser?.name}`}
    />

    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-3">
       
        <input
          id="fileInput"
          type="file"
          className="hidden"
        />
        <label
          htmlFor="fileInput"
          className="bg-[#e5e7eb] rounded-full flex items-center justify-center h-8 w-8 cursor-pointer"
          title="Attach file"
          aria-label="Attach file"
        >
          <span className="text-lg font-bold text-black">+</span>
        </label>

      
        <button type="button" className="underline cursor-pointer bg-transparent p-0">
          Aa
        </button>
        <BsEmojiSmile className="cursor-pointer" title="Emoji" />
        <button type="button" className="cursor-pointer bg-transparent p-0" title="Mention">@</button>
        <CiVideoOn className="cursor-pointer" title="Start Video" />
        <AiTwotoneAudio className="cursor-pointer" title="Start Audio" />
        <CgShortcut className="cursor-pointer" title="Shortcuts" />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1 rounded hover:opacity-95 disabled:opacity-50"
          disabled={loading || !newMsg.trim()}
          aria-label="Send message"
        >
          <IoSend />
        </button>

        <button
          type="button"
          className="p-1 rounded hover:bg-gray-100"
          title="More"
          aria-label="More options"
        >
          <RiArrowDropDownLine className="text-2xl" />
        </button>
      </div>
    </div>
  </form>
</div>

      </div>
    </div>
  );
};

export default Right;
