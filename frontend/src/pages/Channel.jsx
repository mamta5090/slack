import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from 'emoji-picker-react';

import { resetChannelUnread } from "../redux/channelSlice.js"; 
import { setChannelMessages, addChannelMessage, clearChannelMessages } from "../redux/channelMessageSlice";

import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import ChannelSubPage from "../component/channelPage/ChannelSubPage.jsx";

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
import ChannelFilteredFiles from "../component/filePage/ChannelFilteredFiles.jsx";
import ChannelFilterPage from "../component/filePage/ChannelFilterPage.jsx";
const Channel = () => {

  const { channelId } = useParams();
  const dispatch = useDispatch();
  const listEndRef = useRef(null);
  const imageRef = useRef(null);

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
  const [plusOpen, setPlusOpen] = useState(false);
   const [openChannelFileTab, setOpenChannelFileTab] = useState(false);
   const [openChannelFilePage, setOpenChannelFilePage] = useState(false);
const [showPopover, setShowPopover] = useState(false);

  const user = useSelector((state) => state.user.user);
  const me = useSelector((state) => state.user.user);
  const allMessages = useSelector((state) => state.channelMessage.channelMessages) || []; 
  const selectedChannel = useSelector((state) => state.channel.selectedChannelId);
  const socket = useSelector((state) => state.socket?.socket);

  useEffect(() => {
    if (!channelId || !me?._id) return;

    const markRead = async () => {
      try {
        await axios.post(`/api/channel/${channelId}/read`, {}, { withCredentials: true });
        dispatch(resetChannelUnread({ 
            channelId, 
            userId: me._id 
        }));

      } catch (error) {
        console.error("Error marking channel read:", error);
      }
    };
    markRead();
  }, [channelId, me?._id, dispatch]);

   useEffect(() => {
    setActiveTab("messages");
    setShowPopover(false);
  }, [channelId]);

 
 useEffect(() => {
    if (!socket || !channelId || !me?._id) return;

    const handler = async (payload) => {
      const message = payload?.message || payload;
      const incomingChannelId = payload?.channel?._id || payload?.channel || payload?.channelId;

      // 1. If message is for a DIFFERENT channel, ignore it (Sidebar handles the badge)
      if (String(incomingChannelId) !== String(channelId)) {
          return; 
      }

     
      const exists = allMessages.some(m => String(m._id) === String(message._id));
      if (!exists) {
        dispatch(addChannelMessage(message));
      }
      try {
          await axios.post(`/api/channel/${channelId}/read`, {}, { withCredentials: true });
          dispatch(resetChannelUnread({ 
              channelId, 
              userId: me._id 
          }));
      } catch (err) {
          console.error("Error marking active channel read:", err);
      }
    };

    socket.on('newChannelMessage', handler);
    return () => socket.off('newChannelMessage', handler);
  }, [socket, channelId, dispatch, allMessages, me?._id]);


  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!channelId) return;
        setLoading(true);
        dispatch(clearChannelMessages());
        const res = await axios.get(`/api/channel/${channelId}/messages`, {
           withCredentials: true 
        });
        dispatch(setChannelMessages(res.data));
      } catch (error) {
        console.error("Error fetching channel messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [channelId, dispatch]);


  useEffect(() => {
    if (!socket || !channelId) return;
    socket.emit('joinChannel', channelId);
    return () => {
      socket.emit('leaveChannel', channelId);
    };
  }, [socket, channelId]);


 
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [allMessages]);



  const onEmojiClick = (emojiData) => {
    setNewMsg(prevNewMsg => prevNewMsg + emojiData.emoji);
    setShowPicker(false);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
      setPlusOpen(false); 
    }
  };

  const cancelImage = async () => {
    setBackendImage(null);
    setFrontendImage(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() && !backendImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("message", newMsg);
    if (backendImage) {
      formData.append("image", backendImage); 
    }

    try {
      await axios.post(`/api/channel/${channelId}/messages`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewMsg("");
      cancelImage();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
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


  if (!selectedChannel) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading Channel...</p>
      </div>
    );
  }


  return (
    <div className="w-full h-full flex flex-col bg-white py-[40px]">
    
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="cursor-pointer">
               <p onClick={() => setIsSubPageOpen(true)} className="font-bold text-lg truncate">
                 # {selectedChannel.name}
               </p>
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

               <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-gray-600 relative z-30">
          
          {/* MESSAGES TAB */}
          <button 
             onClick={() => setActiveTab("messages")} 
                className={`flex flex-row items-center gap-[5px] font-semibold cursor-pointer pb-1 ${activeTab === 'messages' ? 'border-b-2 border-green-700 text-black' : 'text-gray-500 border-b-2 border-transparent'}`}
          >
            <FiMessageCircle /><span>Message</span>
          </button>
          
          {/* FILES TAB (Hover & Click Logic) */}
          <div 
                className={`flex flex-row items-center gap-[5px] font-semibold cursor-pointer pb-1 ${activeTab === 'files' ? 'border-b-2 border-green-700 text-black' : 'text-gray-500 border-b-2 border-transparent'}`}
             onMouseEnter={() => { if(activeTab !== 'files') setShowPopover(true); }}
             onMouseLeave={() => setShowPopover(false)}
          >
            <button 
               onClick={() => { setActiveTab("files"); setShowPopover(false); }} 
               className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "files" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}
            >
              <LiaFile /><span>Files</span>
            </button>



          {/* POPOVER */}
          {showPopover && activeTab !== 'page' && (
             <div 
               className="absolute top-[35px] left-[100px] z-50"
               onMouseEnter={() => setShowPopover(true)}
               onMouseLeave={() => setShowPopover(false)}
             >
                <ChannelFilteredFiles channelId={channelId} onClose={() => setShowPopover(false)} />
             </div>
          )}
        </div>
 <button 
             onClick={() => setActiveTab("page")} 
                className={`flex flex-row items-center gap-[5px] font-semibold cursor-pointer pb-1 ${activeTab === 'page' ? 'border-b-2 border-green-700 text-black' : 'text-gray-500 border-b-2 border-transparent'}`}
          ><LuFolder /><span>Pages</span></button>
 <button 
             onClick={() => setActiveTab("Untitled")} 
                className={`flex flex-row items-center gap-[5px] font-semibold cursor-pointer pb-1 ${activeTab === 'Untitled' ? 'border-b-2 border-green-700 text-black' : 'text-gray-500 border-b-2 border-transparent'}`}
          ><CgFileAdd /><span>Untitled</span></button>
      </div>
      </header>

     
      <div className="flex-1 overflow-hidden relative w-full bg-gray-50">
        
    
        {activeTab === 'messages' && (
          <div className="h-full flex flex-col">
              {/* Scrollable Message List */}
              <main className="flex-1 overflow-y-auto p-4">
                <div className="max-w-[900px] mx-auto w-full">
                  {allMessages.length === 0 ? (
                    <div className="py-12 text-center text-sm text-gray-500">No messages yet — say hello</div>
                  ) : (
                    allMessages.map((msg, idx) => {
                      const isMine = String(msg.sender?._id) === String(user?._id);
                      const key = msg._id ? `${msg._id}-${idx}` : `msg-${idx}`;
                      return isMine ? <SenderMessage key={key} message={msg.message} createdAt={msg.createdAt} image={msg.image} messageId={msg._id} channelId={channelId} /> : <ReceiverMessage key={key} message={msg.message} createdAt={msg.createdAt} user={msg.sender} image={msg.image} />;
                    })
                  )}
                  <div ref={listEndRef} />
                </div>
              </main>

              {/* Fixed Input Area */}
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
              placeholder={`Message #${selectedChannel.name}`} 
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
                {/* Upload Button */}
                <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Attach file" onClick={() => setPlusOpen(prev => !prev)}>
                  <IoAddSharp />
                </button>
                {/* Emoji Button */}
                <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Emoji" onClick={() => setShowPicker(prev => !prev)}>
                  <BsEmojiSmile />
                </button>
              </div>
      
              {/* File Upload Dropup */}
              {plusOpen && (
                <div className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md border p-2 z-10">
                  <div onClick={() => imageRef.current.click()} className="p-2 hover:bg-gray-100 rounded cursor-pointer whitespace-nowrap">
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
            <div className='absolute bottom-[80px] left-[20px] lg:left-[50px] shadow z-10'>
              <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
      </div>
          </div>
        )}

        {/* VIEW: FILES */}
        {activeTab === 'files' && (
           <ChannelFilterPage channelId={channelId} />
        )}

      </div>


      {/* Edit Topic Modal */}
      {openEditTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4">
          <div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Edit topic</h2>
              <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-5 overflow-y-auto">
              <input type="text" value={topic} onChange={handleTopicChange} className="border rounded-xl p-2 hover:bg-[#f8f8f8]" />
              <p className="text-sm text-gray-700">Add a topic to your conversation.</p>
            </div>
            <div className="flex items-center gap-3 py-4 px-6 justify-end border-t">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button>
              <button type="button" onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save topic"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Input Area */}
     
    </div>
  );
};

export default Channel;