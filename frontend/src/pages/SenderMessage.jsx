import React, { memo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../component/Avatar";
import axios from "axios";
import { removeChannelMessage } from "../redux/channelMessageSlice";
import { removeMessage } from "../redux/messageSlice";
import useClickOutside from "../hook/useClickOutside"; // Assuming you have this hook

// Icons
import { MdAddReaction, MdReply, MdShare, MdBookmarkBorder, MdMoreVert } from "react-icons/md";
import { BiMessageRoundedDetail } from "react-icons/bi";

const SenderMessage = ({ message, createdAt, image, messageId, channelId }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false); // Controls the dropdown menu
  
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setShowMenu(false));

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

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
      className="group relative flex mb-1 hover:bg-gray-50 px-4 py-2 -mx-4 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      {/* Avatar & Message Content */}
      <div className="flex flex-row gap-3 items-start w-full">
        {user && <div className="mt-1"><Avatar user={user} size="md" /></div>}
        
        <div className="flex flex-col w-full">
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold text-[15px] text-gray-900">{user?.name || "Unknown"}</h1>
            <span className="text-xs text-gray-500">{formattedTime}</span>
          </div>
          
          {image && (
            <img src={image} alt="Sent content" className="rounded-md mt-2 max-w-[360px] max-h-[300px] object-cover border border-gray-200" />
          )}
          
          {message && <p className="text-[15px] text-gray-800 mt-0.5 leading-relaxed">{message}</p>}
        </div>
      </div>

      {/* Floating Action Bar (Visible on Hover or Menu Open) */}
      {(isHovered || showMenu) && (
        <div className="absolute -top-3 right-4 bg-white border border-gray-200 shadow-sm rounded-md flex items-center p-1 z-10">
          
          {/* Reaction */}
          <button className="p-1.5 hover:bg-gray-100 rounded text-gray-500" title="Add reaction">
            <MdAddReaction size={18} />
          </button>

          {/* Reply in Thread */}
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

          {/* More Actions (Three Dots) */}
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
              <div className="absolute right-0 top-8 w-64 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-50 text-sm text-gray-700">
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
                
                {/* DELETE BUTTON (Red text usually, white on hover) */}
                <div 
                  onClick={handleDelete}
                  className="px-4 py-1.5 hover:bg-[#e01e5a] hover:text-white text-[#e01e5a] cursor-pointer flex justify-between font-medium"
                >
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