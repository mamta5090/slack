import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LiaFile } from "react-icons/lia";
import { LuFolder } from "react-icons/lu";
import { CgFileAdd } from "react-icons/cg";
import { FiMessageCircle } from "react-icons/fi";
import { setMessages, clearMessages } from "../redux/messageSlice";
import { setSelectedChannelId } from "../redux/channelSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import { FaUserFriends } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { IoSend, IoAddSharp } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import ChannelSubPage from "../component/subpage/ChannelSubPage";

const Channel = () => {
  const { channelId } = useParams();
  const dispatch = useDispatch();
  const listEndRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [activeTab, setActiveTab] = useState("messages");
  const [isSubPageOpen, setIsSubPageOpen] = useState(false);
  const [openEditTopic, setOpenEditTopic] = useState(false);
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
    
  const user = useSelector((state) => state.user.user);
  const allMessages = useSelector((state) => state.message.messages) || [];
  const selectedChannel = useSelector((state) => state.channel.selectedChannelId);

  useEffect(() => {
    dispatch(clearMessages());
    const shouldFetchChannel = !selectedChannel || String(selectedChannel._id) !== String(channelId);
    if (shouldFetchChannel) {
      const fetchChannelDetails = async () => {
        try {
          const res = await axios.get(`/api/channel/${channelId}`);
          dispatch(setSelectedChannelId(res.data));
        } catch (error) {
          console.error("Error fetching channel details:", error);
        }
      };
      fetchChannelDetails();
    }

    const fetchChannelMessages = async () => {
      try {
        const res = await axios.get(`/api/channels/${channelId}/messages`);
        dispatch(setMessages(Array.isArray(res.data) ? res.data : []));
      } catch (error) {
        console.error("Error fetching channel messages:", error);
      }
    };

    fetchChannelMessages();
  }, [channelId, dispatch, selectedChannel]);

  // Auto-scroll to latest message
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (!newMsg.trim()) return;
    setLoading(true);
    try {
      await axios.post(`/api/message/send/channel/${channelId}`, { message: newMsg });
      setNewMsg("");
    } catch (error) {
      console.error("Error sending message to channel", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  const onKeyDown = (e) => {
    // Send on Ctrl/Cmd + Enter
    if ((e.key === "Enter" || e.keyCode === 13) && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

   const handleSaveTopic = async () => {
    try {
      const payload = { topic };
      const res = await axios.put(`/api/conversation/topic/with/${user._id}`, payload, authHeaders());
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
      const handleCancel = () => { setOpenEdit(false); setOpenEditTopic(false); };

  if (!selectedChannel || String(selectedChannel._id) !== String(channelId)) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading Channel...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white py-[40px]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Channel name + meta */}
          <div className="flex items-start gap-4 min-w-0">
            <div  className="cursor-pointer">
               <p onClick={() => setIsSubPageOpen(true)} className="font-bold text-lg truncate"># {selectedChannel.name}</p>

            </div>

           
          </div>

          {/* Right: members + actions */}
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
          className="fixed inset-0 bg-black/50 z-50 flex items-center  justify-center p-4"
            channel={selectedChannel} 
            onClose={() => setIsSubPageOpen(false)} 
          />
        )}

 <div className="hidden sm:flex items-center gap-3 ml-4 text-xs text-gray-600">
              <button
                onClick={() => setActiveTab("messages")}
                className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "messages" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
                <FiMessageCircle />
                <span>Message</span>
              </button>

              <button
                onClick={() => setActiveTab("files")}
                className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "files" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
                <LiaFile />
                <span>Files</span>
              </button>

              <button
                onClick={() => setActiveTab("pages")}
                className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "pages" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
                <LuFolder />
                <span>Pages</span>
              </button>

              <button
                onClick={() => setActiveTab("create")}
                className={`flex items-center gap-2 px-3 py-1 rounded-md ${activeTab === "create" ? "bg-gray-100 text-black font-medium" : "hover:bg-gray-50"}`}>
                <CgFileAdd />
                <span>Untitled</span>
              </button>
            </div>
            
        {/* Mobile tab bar */}
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

      {/* Input area */}
      <footer className="flex-shrink-0 p-4 border-t bg-white">
        <form onSubmit={onSubmit} className="max-w-[900px] mx-auto w-full">
          <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Message #${selectedChannel.name}`}
              className="w-full p-3 min-h-[64px] outline-none resize-none"
              disabled={loading}
              aria-label={`Message to ${selectedChannel.name}`}
            />

            <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
              <div className="flex items-center gap-3 text-gray-600">
                <IoAddSharp className="cursor-pointer text-xl" />
                <BsEmojiSmile className="cursor-pointer text-xl" />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mr-2 hidden sm:inline">Press Ctrl/Cmd + Enter to send</span>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#007a5a] text-white px-3 py-1.5 rounded disabled:opacity-50"
                  disabled={loading || !newMsg.trim()}>
                  <IoSend />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default Channel;