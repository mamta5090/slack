import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Sidebar from '../pages/Sidebar';
import Topbar from '../pages/Topbar';
import Avatar from './Avatar';
import VideoCallUI from "../component/VideoCallUI.jsx";
import { useWebRTC } from '../hook/useWebRTC.js';
import { CiHeadphones } from "react-icons/ci";
import { setSingleUser } from '../redux/userSlice';
import { fetchConversations, selectAllConversations } from '../redux/conversationSlice';

const Huddles = () => {
  const dispatch = useDispatch();
  
  // Local State
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null); 
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isStartHuddleOpen, setIsStartHuddleOpen] = useState(false);
  const [pendingCallUserId, setPendingCallUserId] = useState(null);
 
  const containerRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (document.getElementById('start-huddle-modal')?.contains(event.target)) {
        return;
      }
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveFilter(null);
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Redux Data
  const { socket } = useSelector((state) => state.socket);
  const singleUser = useSelector((state) => state.user.singleUser);
  const loggedInUser = useSelector((state) => state.user.user);
  const allUsers = useSelector((state) => state.user.allUsers) || [];
  const conversations = useSelector(selectAllConversations) || [];

  // WebRTC Hook
  const {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    hangUp,
    incomingCallFrom,
    isLocalAudioMuted,
    isLocalVideoMuted,
    toggleAudio,
    toggleVideo
  } = useWebRTC(socket, singleUser);

  const otherUserForCall = callState === 'receiving' ? incomingCallFrom : singleUser;

  // Wait for Redux to update before starting call
  useEffect(() => {
    if (pendingCallUserId && singleUser && singleUser._id === pendingCallUserId) {
      startCall(pendingCallUserId);
      setPendingCallUserId(null);
    }
  }, [singleUser, pendingCallUserId, startCall]);

  const handleStartHuddle = (userId) => {
    const userToCall = allUsers.find(u => u._id === userId);
    if (userToCall) {
        dispatch(setSingleUser(userToCall));
        setPendingCallUserId(userId);
        setIsStartHuddleOpen(false);
    }
  };

  // Helper to format date
  const formatTime = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return "Just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      return date.toLocaleDateString();
  };

  return (
    <div className="w-full h-screen bg-[#f3f4f6] overflow-hidden font-sans" ref={containerRef}>
      
      {/* Background UI Components */}
      <Topbar />
      <Sidebar />
      <HomePageSidebar />

      {/* Main Content Area */}
      <div className={`flex flex-col h-full md:ml-[30%] ml-[30%] md:w-[70%] w-[70%] pt-12 bg-white border-l border-gray-200 relative ${callState !== 'idle' ? 'filter blur-sm pointer-events-none' : ''}`}>
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0 z-20">
          <h1 className="text-lg font-bold text-gray-900">Huddles</h1>
          <button 
            onClick={() => setIsStartHuddleOpen(true)}
            className="flex items-center gap-1 border border-gray-300 rounded text-sm font-medium px-3 py-1 hover:bg-gray-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New huddle
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="max-w-4xl">
            <h2 className="text-[15px] font-bold text-gray-900 mb-4">Recent huddles</h2>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 relative z-30">
              <div className="relative">
                <FilterButton 
                  label="All huddles" 
                  isOpen={activeFilter === 'all'} 
                  onClick={() => setActiveFilter(activeFilter === 'all' ? null : 'all')} 
                />
                {activeFilter === 'all' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-1.5 bg-[#1264a3] text-white cursor-pointer">
                      <span className="text-sm font-medium">All huddles</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex flex-col gap-2">
                {conversations.map((conv) => {
                    const otherUser = conv.participants?.find(p => p._id !== loggedInUser?._id) || conv.participants?.[0];
                    if (!otherUser) return null;

                    return (
                        <div key={conv._id} className="relative">
                            
                            {/* Hover Tooltip */}
                            {hoveredItem === conv._id && activeMenuId !== conv._id && !isStartHuddleOpen && (
                                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1.5 px-3 rounded shadow-lg z-40 text-center whitespace-nowrap">
                                    <p className="font-bold">Go to conversation</p>
                                    <p className="text-gray-300 font-normal">{otherUser.name}</p>
                                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                                </div>
                            )}

                            <div 
                                className="group border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white relative z-10"
                                onMouseEnter={() => setHoveredItem(conv._id)}
                                onMouseLeave={() => setHoveredItem(null)}
                            >
                                {/* Left: Icon & Info */}
                                <div className="flex items-center gap-4">
                                    <div 
                                        onClick={() => handleStartHuddle(otherUser._id)}
                                        className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-[#1164a3] hover:text-white transition-colors"
                                    >
                                        <CiHeadphones className='text-2xl'/>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 text-sm">{otherUser.name}</span>
                                        <span className="text-xs text-gray-500 mt-0.5">
                                            {formatTime(conv.updatedAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Right: Avatars & Menu */}
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        <img className="w-6 h-6 rounded-md border-2 border-white object-cover" src={otherUser.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="User" />
                                        <img className="w-6 h-6 rounded-md border-2 border-white object-cover" src={loggedInUser?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"} alt="Me" />
                                    </div>

                                    <div className="relative" onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setActiveMenuId(activeMenuId === conv._id ? null : conv._id); 
                                        setActiveFilter(null); 
                                    }}>
                                        <button className={`p-1 rounded transition-colors ${activeMenuId === conv._id ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="1"></circle>
                                                <circle cx="12" cy="5" r="1"></circle>
                                                <circle cx="12" cy="19" r="1"></circle>
                                            </svg>
                                        </button>

                                        {activeMenuId === conv._id && (
                                            <div className="absolute right-0 top-8 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                                                <div className="flex items-center justify-between px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer group/item">
                                                    <span className="text-sm">See participants</span>
                                                    <span className="text-xs text-gray-400 group-hover/item:text-white">2 members</span>
                                                </div>
                                                <div className="px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer text-sm">Save for later</div>
                                                <div className="px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer text-sm">Copy huddle link</div>
                                                <div className="px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer text-sm">Edit huddle topic</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Start Huddle Modal (Z-Index 50) */}
      {isStartHuddleOpen && (
        <StartHuddleModal 
          onClose={() => setIsStartHuddleOpen(false)} 
          onStartHuddle={handleStartHuddle}
        />
      )}

      {/* 2. Video Call UI (Highest Z-Index to stay on top) */}
      {callState !== 'idle' && (
        <div className="fixed inset-0 z-[9999]">
          <VideoCallUI
            callState={callState}
            localStream={localStream}
            remoteStream={remoteStream}
            acceptCall={acceptCall}
            hangUp={hangUp}
            otherUser={otherUserForCall}
            isLocalAudioMuted={isLocalAudioMuted}
            isLocalVideoMuted={isLocalVideoMuted}
            toggleAudio={toggleAudio}
            toggleVideo={toggleVideo}
          />
        </div>
      )}

    </div>
  );
};

// --- SUB COMPONENTS ---

const FilterButton = ({ label, isOpen, onClick }) => {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-2 border px-3 py-1.5 rounded text-sm font-medium transition-colors ${isOpen ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
    >
      {label}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" height="14" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
};

const StartHuddleModal = ({ onClose, onStartHuddle }) => {
  const [activeTab, setActiveTab] = useState('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const allUsers = useSelector((state) => state.user.allUsers) || [];
  const loggedInUser = useSelector((state) => state.user.user);
  const onlineUsers = useSelector((state) => state.socket.onlineUsers) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40" id="start-huddle-modal">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] overflow-hidden flex flex-col max-h-[80vh] relative animate-fadeIn">
        <div className="p-6 pb-2">
            <div className="flex justify-between items-start mb-1">
                <h2 className="text-2xl font-bold text-gray-900">Start a huddle</h2>
                <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <p className="text-gray-600 text-[15px] mb-4">Find a person or channel to huddle with</p>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name" className="w-full border-2 border-blue-400 rounded p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-100" autoFocus />
        </div>
        <div className="flex px-6 border-b border-gray-200">
            <button onClick={() => setActiveTab('people')} className={`mr-6 pb-3 text-[15px] font-medium transition-colors ${activeTab === 'people' ? 'text-[#4a154b] border-b-[3px] border-[#4a154b]' : 'text-gray-600 hover:text-gray-900'}`}>People</button>
            <button onClick={() => setActiveTab('channels')} className={`pb-3 text-[15px] font-medium transition-colors ${activeTab === 'channels' ? 'text-[#4a154b] border-b-[3px] border-[#4a154b]' : 'text-gray-600 hover:text-gray-900'}`}>Channels</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            {allUsers.filter(u => u && u.name && u._id !== loggedInUser?._id).filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => {
                    const isOnline = onlineUsers.includes(u._id);
                    const isSelected = selectedUserId === u._id;
                    return (
                        <div key={u._id} onClick={() => setSelectedUserId(u._id)} className={`flex items-center gap-3 p-2 rounded-md cursor-pointer group ${isSelected ? 'bg-[#1164a3] text-white' : 'hover:bg-[#1164a3] hover:text-white'}`}>
                            <div className="relative"><Avatar user={u} className="w-9 h-9 rounded-md object-cover" /></div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[15px]">{u.name.charAt(0).toUpperCase() + u.name.slice(1)}</span>
                                    <div className="flex items-center justify-center">{isOnline ? (<div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-[#2bac76] group-hover:bg-white'}`}></div>) : (<div className={`w-2 h-2 rounded-full border ${isSelected ? 'border-white' : 'border-gray-500 group-hover:border-white'}`}></div>)}</div>
                                    <span className={`text-[15px] font-light ${isSelected ? 'opacity-100' : 'opacity-90'}`}>{u.name}</span>
                                </div>
                                <span className={`text-xs ${isSelected ? 'opacity-90' : 'opacity-70'}`}>{u.title || u.email || "Team Member"}</span>
                            </div>
                        </div>
                    );
                })}
        </div>
        <div className="p-6 pt-4 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-900 border border-gray-300 rounded font-bold hover:bg-gray-50 text-[15px]">Cancel</button>
            <button disabled={!selectedUserId} onClick={() => selectedUserId && onStartHuddle(selectedUserId)} className={`px-4 py-2 rounded font-bold text-[15px] transition-colors ${selectedUserId ? 'bg-[#007a5a] text-white hover:bg-[#148567] cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-default'}`}>Start a huddle</button>
        </div>
      </div>
    </div>
  );
};

export default Huddles;