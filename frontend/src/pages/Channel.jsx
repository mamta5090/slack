import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from 'emoji-picker-react';
//import { setMessages, addMessage } from "../redux/messageSlice";
import { socket } from "../socket";

// --- Icon Imports (All necessary icons are now included) ---
import { LiaFile } from "react-icons/lia";
import { LuFolder } from "react-icons/lu";
import { CgFileAdd } from "react-icons/cg";
import { FiMessageCircle, FiBold, FiItalic } from "react-icons/fi";
import { FaUserFriends, FaStrikethrough, FaListUl, FaCode } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { IoSend, IoAddSharp } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx";
import { GoLink, GoQuote } from "react-icons/go";
import { AiOutlineOrderedList } from "react-icons/ai";
import { RiCodeBlock } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";

// --- Component Imports ---
import { setChannelMessages, addChannelMessage, clearChannelMessages } from "../redux/channelMessageSlice";
import { setSelectedChannelId } from "../redux/channelSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import ChannelSubPage from "../component/subpage/ChannelSubPage";

const Channel = () => {
  // --- Hooks Initialization ---
  const { channelId } = useParams();
  const dispatch = useDispatch();
  const listEndRef = useRef(null);
  const imageRef = useRef(null);

  // --- State Management ---
  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [isSubPageOpen, setIsSubPageOpen] = useState(false);
  const [openEditTopic, setOpenEditTopic] = useState(false);
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [pluesOpen, setPlusOpen] = useState(false);
    
  // --- Redux State Selection ---
  const user = useSelector((state) => state.user.user);
const allMessages = useSelector((state) => state.channelMessage.channelMessages) || []; 
const selectedChannel = useSelector((state) => state.channel.selectedChannelId);

  // --- Effect for Fetching Channel Data and Messages ---
  useEffect(() => {
    dispatch(clearChannelMessages());
    const shouldFetchChannel = !selectedChannel || String(selectedChannel._id) !== String(channelId);
    if (shouldFetchChannel) {
      const fetchChannelDetails = async () => {
        try {
          const res = await axios.get(`/api/channel/${channelId}`,{withCredentials:true });
          dispatch(setSelectedChannelId(res.data));
        } catch (error) {
          console.error("Error fetching channel details:", error);
        }
      };
      fetchChannelDetails();
    }

   

    const fetchChannelMessages = async () => {
      try {
        const res = await axios.get(`/api/channel/${channelId}/messages`,{withCredentials:true});
        dispatch(setChannelMessages(Array.isArray(res.data) ? res.data : []));
      } catch (error) {
        console.error("Error fetching channel messages:", error);
      }
    };

    fetchChannelMessages();
  }, [channelId, dispatch, selectedChannel]);

  // --- Effect for Auto-scrolling to the Latest Message ---
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [allMessages]);

  // --- Event Handlers ---
  const onEmojiClick = (emojiData) => {
    setNewMsg(prevNewMsg => prevNewMsg + emojiData.emoji);
    setShowPicker(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const cancelImage = async () => {
    setBackendImage(null);
    setFrontendImage(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      // Add the message to the Redux store
      dispatch(addChannelMessage(newMessage));
    };

    // Listen for the 'newChannelMessage' event
    socket.on("newChannelMessage", handleNewMessage);

    // Cleanup function to run when the component unmounts
    return () => {
      socket.off("newChannelMessage", handleNewMessage);
    };
  }, [dispatch]); // Dependency array ensures this only runs once per component instance

  // --- Effect for Auto-scrolling to the Latest Message ---
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [allMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() && !backendImage) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("message", newMsg);
      if (backendImage) {
        formData.append("image", backendImage);
      }
      await axios.post(`/api/channel/${channelId}/messages`, { message: newMsg },{withCredentials:true});
      setNewMsg("");
      cancelImage();
      setFrontendImage(null)
    } catch (error) {
      console.error("Error sending message to channel", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const handleSaveTopic = async () => {
    setSaving(true);
    try {
      const payload = { topic };
      const res = await axios.put(`/api/conversation/topic/with/${user._id}`, payload);
      if (res.data) console.log("Topic updated successfully", res.data);
      setOpenEditTopic(false);
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Failed to update topic.");
    } finally {
      setSaving(false);
    }
  };

  const handleTopicChange = (e) => setTopic(e.target.value);
  const handleCancel = () => { setOpenEditTopic(false); };

  // --- Loading State UI ---
  if (!selectedChannel || String(selectedChannel._id) !== String(channelId)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading Channel...</p>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="w-full h-full flex flex-col bg-white py-[40px]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="cursor-pointer">
               <p onClick={() => setIsSubPageOpen(true)} className="font-bold text-lg truncate"># {selectedChannel.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md p-1.5 cursor-pointer h-8">
              <p className="font-semibold text-sm mr-2">{selectedChannel.members?.length || 0}</p>
              <FaUserFriends className="text-lg" />
            </div>
            <div className="hover:bg-gray-100 rounded-md p-1.5 cursor-pointer h-8 w-8 flex items-center justify-center">
              <IoMdMore className="text-xl" />
            </div>
          </div>
        </div>

        {isSubPageOpen && (
          <ChannelSubPage
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            channel={selectedChannel} 
            onClose={() => setIsSubPageOpen(false)} 
          />
        )}

        <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-gray-600">
          <button onClick={() => setActiveTab("messages")} className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "messages" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
            <FiMessageCircle />
            <span>Message</span>
          </button>
          <button onClick={() => setActiveTab("files")} className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "files" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
            <LiaFile />
            <span>Files</span>
          </button>
          <button onClick={() => setActiveTab("pages")} className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "pages" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
            <LuFolder />
            <span>Pages</span>
          </button>
          <button onClick={() => setActiveTab("create")} className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "create" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
            <CgFileAdd />
            <span>Untitled</span>
          </button>
        </div>
            
        <div className="sm:hidden border-t">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3 text-xs text-gray-700">
              <button onClick={() => setActiveTab("messages")} className={`flex items-center gap-2 ${activeTab === "messages" ? "font-semibold" : ""}`}><FiMessageCircle />Message</button>
              <button onClick={() => setActiveTab("files")} className={`flex items-center gap-2 ${activeTab === "files" ? "font-semibold" : ""}`}><LiaFile />Files</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-md p-1.5 cursor-pointer h-8">
                <p className="font-semibold text-sm mr-2">{selectedChannel.members?.length || 0}</p>
                <FaUserFriends className="text-lg" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <div className="max-w-[900px] mx-auto w-full">
          {allMessages.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">No messages yet — say hello 👋</div>
          ) : (
            allMessages.map((msg, idx) => {
              const isMine = String(msg.sender?._id) === String(user?._id);
              const key = msg._id || `msg-${idx}`;
              return isMine ? (
                <SenderMessage key={key} message={msg.message} createdAt={msg.createdAt} />
              ) : (
                <ReceiverMessage key={key} message={msg.message} createdAt={msg.createdAt} user={msg.sender} />
              );
            })
          )}
          <div ref={listEndRef} />
        </div>
      </main>

        {/* <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-white ">
        {allMessages.map((msg, idx) => {
          const isMine = String(msg.sender?._id) === String(user._id);
          const key = msg._id ? `${msg._id}-${idx}` : `msg-${idx}`;
          
          // --- FIX: Pass the msg.image property to your components ---
          return isMine ? (
            <SenderMessage 
              key={key} 
              message={msg.message} 
              createdAt={msg.createdAt} 
              image={msg.image}
            />
          ) : (
            <ReceiverMessage 
              key={key} 
              message={msg.message} 
              createdAt={msg.createdAt} 
              user={msg.sender}
              image={msg.image} 
            />
          );
        })}
        <div ref={listEndRef} />
      </div> */}

      {openEditTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4">
          <div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Edit topic</h2>
              <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-5 overflow-y-auto">
              <input type="text" value={topic} onChange={handleTopicChange} className="border rounded-xl p-2 hover:bg-[#f8f8f8]" />
              <p className="text-sm text-gray-700">Add a topic to your conversation with {user.name}. This will be visible to both of you at the top of your DM.</p>
            </div>
            <div className="flex items-center gap-3 py-4 px-6 justify-end border-t">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button>
              <button type="button" onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save topic"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white mb-[10px]">
        <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
          <div className="flex flex-row items-center gap-5 bg-gray-100 px-3 py-2 order-1">
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
      
          <form onSubmit={sendMessage} className="flex flex-col order-2">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message #${selectedChannel.name}`} // <<< CORRECTED
              className="w-full p-3 min-h-[60px] outline-none resize-none"
              disabled={loading}
            />
            
            {frontendImage && (
              <div className="p-2">
                <div className="relative w-20 h-20">
                  <div className="group relative h-full w-full">
                    <img src={frontendImage} alt="Preview" className="h-full w-full rounded-md object-cover"/>
                    <button onClick={cancelImage} className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Remove image">
                      <RxCross2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
      
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 relative">
              <div className="flex items-center gap-3 text-gray-600">
                <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Attach file" onClick={() => setPlusOpen(prev => !prev)}>
                  <IoAddSharp />
                </button>
                <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Emoji" onClick={() => setShowPicker(prev => !prev)}>
                  <BsEmojiSmile />
                </button>
              </div>
      
              {pluesOpen && (
                <div className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md border p-2">
                  <div onClick={() => imageRef.current.click()} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                    Upload from your computer
                    <input type="file" hidden accept="image/*" ref={imageRef} onChange={handleImage} />
                  </div>
                </div>
              )}
      
              <div className="flex items-center gap-2">
                <button type="submit" className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1 rounded hover:bg-[#006a4e] disabled:opacity-50" disabled={loading || (!newMsg.trim() && !backendImage)}>
                  <IoSend />
                </button>
                <div className="h-5 w-px bg-gray-300" />
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <MdKeyboardArrowDown className="text-2xl" />
                </button>
              </div>
            </div>
          </form>
      
          {showPicker && (
            <div className='absolute bottom-[80px] left-[260px] lg:left-[460px] shadow z-10'>
              <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;