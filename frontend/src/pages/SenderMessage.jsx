import React, { memo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../component/Avatar";
import axios from "axios";
import { removeChannelMessage } from "../redux/channelMessageSlice";
import { removeMessage } from "../redux/messageSlice";
import useClickOutside from "../hook/useClickOutside";
import { CiClock2 } from "react-icons/ci";

// Icons
import { MdAddReaction, MdReply, MdShare, MdBookmarkBorder, MdMoreVert } from "react-icons/md";
import { BiMessageRoundedDetail } from "react-icons/bi";
import Status from "./Status";

const SenderMessage = ({ message, createdAt, image, messageId, channelId }) => {
  const user = useSelector((state) => state.user.user);
  const { socket, onlineUsers = [] } = useSelector((state) => state.socket);
  const dispatch = useDispatch();

  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  
  const isOnline = user && onlineUsers.includes(user._id);

  const menuRef = useRef(null);
  const profileCardRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  useClickOutside(menuRef, () => setShowMenu(false));
  useClickOutside(profileCardRef, () => setShowProfileCard(false)); 

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  // --- HOVER LOGIC START ---
  const handleMouseEnter = () => {
    // If we re-enter the name or the card before the timer fires, cancel the close
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setShowProfileCard(true);
  };

  const handleMouseLeave = () => {
    // Wait 300ms before closing to give user time to move mouse to the card
    closeTimeoutRef.current = setTimeout(() => {
      setShowProfileCard(false);
    }, 300);
  };
  // --- HOVER LOGIC END ---

  const isMe = !!user?._id; 

  const getLocalTime = () => {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " local time";
  };

  const handleDelete = async () => {
    if (!messageId) return;
    if (!window.confirm("Delete this message?")) return;

    try {
      if (channelId) {
        await axios.delete(`/api/channel/${channelId}/messages/${messageId}`, { withCredentials: true });
        dispatch(removeChannelMessage(messageId));
      } else {
        await axios.delete(`/api/message/delete/${messageId}`, { withCredentials: true });
        dispatch(removeMessage(messageId));
      }
      setShowMenu(false);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete message");
    }
  };

  return (
    <div
      className={`group relative flex mb-1 hover:bg-gray-50 px-4 py-2 -mx-4 transition-colors ${showProfileCard || showMenu ? 'z-50' : 'z-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      
      {/* USER INFO + PROFILE CARD WRAPPER */}
      <div 
        className="relative w-full" 
        ref={profileCardRef} 
        // Note: Removed onMouseEnter/Leave from here so it doesn't trigger on the whole row
      >
        <div className="flex items-center gap-2 p-1 rounded-md -ml-1 select-none w-full">
          <div className="flex flex-row gap-3 items-start w-full">
            {user && <div className="mt-1"><Avatar user={user} size="md" /></div>}

            <div className="flex flex-col w-full text-left">
              <div className="flex items-baseline gap-2">
                
                {/* --- USER NAME TRIGGER --- */}
                <h1 
                  className="font-bold text-[15px] text-gray-900 cursor-pointer hover:underline"
                  onMouseEnter={handleMouseEnter} // Trigger Open on Name Hover
                  onMouseLeave={handleMouseLeave} // Trigger Delayed Close on Leave
                  onClick={() => setShowProfileCard((prev) => !prev)} // Keep click for mobile/instant toggle
                >
                  {user?.name || "Unknown"}
                </h1>
                {/* ------------------------- */}

                <span className="text-xs text-gray-500">{formattedTime}</span>
              </div>

              {image && (
                <img src={image} alt="Sent content" className="rounded-md mt-2 max-w-[360px] max-h-[300px] object-cover border border-gray-200" />
              )}

              {message && <p className="text-[15px] text-gray-800 mt-0.5 leading-relaxed">{message}</p>}
            </div>
          </div>
        </div>

        {/* --- THE PROFILE CARD DIV --- */}
        {showProfileCard && (
          <div 
            className="absolute top-[30px] left-0 w-[300px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in duration-100 z-[100]"
            // IMPORTANT: Keep these here so the card stays open when you mouse over it
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="p-5">
              {/* Avatar Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <Avatar user={user} size="lg" />
                </div>
                <div className="flex flex-col flex-1 ml-4 mt-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      {user.name} {isMe && "(you)"}
                    </h3>
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              </div>

              {/* Time Row */}
              <div className="flex items-center gap-2 text-gray-700 mb-6">
                <CiClock2 className="text-xl" />
                <span className="text-sm font-medium">{getLocalTime()}</span>
              </div>

              {/* Action Button */}
              {isMe ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileCard(false);
                    setShowStatusModal(true);
                  }}
                  className="w-full py-1.5 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors"
                >
                  Set a status
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProfileCard(false);
                  }}
                  className="w-full py-1.5 px-4 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors"
                >
                  View full profile
                </button>
              )}
            </div>
          </div>
        )}
      </div>

       {showStatusModal && (
        <Status onClose={() => setShowStatusModal(false)} />
      )}

      {/* Floating Action Bar */}
      {(isHovered || showMenu) && (
        <div className="absolute -top-3 right-4 bg-white border border-gray-200 shadow-sm rounded-md flex items-center p-1 z-[60]">
          {/* Reaction */}
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Add reaction">
            <MdAddReaction size={18} />
          </button>
          
          {/* Reply */}
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Reply in thread">
            <BiMessageRoundedDetail size={18} />
          </button>
          
          {/* Share */}
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Forward">
            <MdShare size={18} />
          </button>
          
          {/* Save */}
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Save">
            <MdBookmarkBorder size={18} />
          </button>

          {/* More Actions */}
          <div className="relative" ref={menuRef}>
            <button
              className={`p-1.5 rounded text-gray-500 ${showMenu ? 'bg-gray-100 text-black' : 'hover:bg-gray-100'}`}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              title="More actions"
            >
              <MdMoreVert size={18} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-[70] text-sm text-gray-700">
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer">Turn off notifications for replies</div>
                <div className="border-t my-1"></div>
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer flex justify-between">
                  <span>Mark unread</span> <span className="text-xs opacity-60">U</span>
                </div>
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer">Remind me about this</div>
                <div className="border-t my-1"></div>
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer">Copy link</div>
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer">Pin to this conversation</div>
                <div className="border-t my-1"></div>
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer flex justify-between">
                  <span>Edit message</span> <span className="text-xs opacity-60">E</span>
                </div>
                <div onClick={handleDelete} className="px-4 py-1.5 hover:bg-[#e01e5a] hover:text-white text-[#e01e5a] cursor-pointer flex justify-between font-medium">
                  <span>Delete message...</span> <span className="text-xs opacity-80">delete</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(SenderMessage);