import React, { memo, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "../component/Avatar";
import axios from "axios";
import useClickOutside from "../hook/useClickOutside";
import { serverURL } from "../main";
import EmojiPicker from 'emoji-picker-react';

// Icons
import { MdAddReaction, MdShare, MdBookmarkBorder, MdMoreVert, MdOutlineForwardToInbox } from "react-icons/md";
import { BiMessageRoundedDetail } from "react-icons/bi";

const ReceiverMessage = ({ message, createdAt, image, isDeleted, user, messageId, reactions = [], onForward }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user); // The logged-in user
  const singleUser = useSelector((state) => state.user.singleUser); // The person we are chatting with
  
  const [isHovered, setIsHovered] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const reactionPickerRef = useRef(null);
  const menuRef = useRef(null);

  useClickOutside(reactionPickerRef, () => setShowReactionPicker(false));
  useClickOutside(menuRef, () => setShowMenu(false));

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const displayUser = singleUser || user;

  const handleReactionSelect = async (emojiData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${serverURL}/api/message/react/${messageId}`, { emoji: emojiData.emoji }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowReactionPicker(false);
    } catch (error) {
      console.error("Reaction failed", error);
    }
  };

  const handlePillClick = (emoji) => {
    handleReactionSelect({ emoji });
  };

  const triggerForward = () => {
    onForward({ 
      messageId: messageId,
      image: image,
      name: message ? (message.length > 30 ? message.substring(0, 30) + '...' : message) : 'Image file', 
      sender: displayUser?.name, 
      time: formattedTime 
    });
  };

  if (isDeleted) {
    return (
      <div className="px-4 py-2 text-gray-400 italic text-sm">
        This message was deleted
      </div>
    );
  }

  return (
    <div 
      className={`group relative flex mb-1 hover:bg-gray-50 px-4 py-2 -mx-4 transition-colors ${showReactionPicker || showMenu ? 'z-40' : 'z-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <div className="flex flex-row gap-3 items-start w-full">
        {/* Avatar */}
        <div className="mt-1">
          {displayUser && <Avatar user={displayUser} size="md" />}
        </div>

        {/* Message Content Area */}
        <div className="flex flex-col flex-1 text-left">
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold text-[15px] text-gray-900 cursor-pointer hover:underline">
                {displayUser?.name || "Unknown"}
            </h1>
            <span className="text-xs text-gray-500 font-medium">{formattedTime}</span>
          </div>

          {image && (
            <img
              src={image}
              alt="Received content"
              className="rounded-md mt-2 max-w-[360px] max-h-[300px] object-cover border border-gray-200"
            />
          )}
          
          {message && <p className="text-[15px] text-gray-800 mt-0.5 leading-relaxed">{message}</p>}

          {/* --- REACTION PILLS SECTION --- */}
          {reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 items-center">
              {reactions.map((react, idx) => {
                const hasReacted = react.users?.includes(currentUser?._id);
                return (
                  <button
                    key={idx}
                    onClick={() => handlePillClick(react.emoji)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border transition-all text-[13px] font-medium
                      ${hasReacted 
                        ? "bg-[#e8f0f5] border-[#1264a3] text-[#1264a3]" 
                        : "bg-gray-100 border-transparent hover:border-gray-300 text-gray-600"
                      }`}
                  >
                    <span>{react.emoji}</span>
                    <span className="text-[11px] font-bold">{react.users?.length || 0}</span>
                  </button>
                );
              })}

              {/* Small Add Reaction Icon inside the pill area */}
              <button 
                onClick={() => setShowReactionPicker(true)}
                className="p-1 px-2 rounded-full bg-gray-100 hover:bg-gray-200 border border-transparent hover:border-gray-300 text-gray-500 transition-all flex items-center justify-center h-[24px]"
              >
                <MdAddReaction size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- FLOATING ACTION BAR --- */}
      {(isHovered || showMenu || showReactionPicker) && (
        <div className="absolute -top-4 right-4 bg-white border border-gray-300 shadow-sm rounded-lg flex items-center p-0.5 z-[60] h-9">
          
          {/* Reaction Button */}
          <div className="relative" ref={reactionPickerRef}>
            <button 
              onClick={() => setShowReactionPicker(!showReactionPicker)} 
              className={`p-2 rounded-md transition-colors ${showReactionPicker ? 'bg-gray-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <MdAddReaction size={18}/>
            </button>
            <Tooltip label="Add reaction" />
            {showReactionPicker && (
              <div className="absolute bottom-full right-0 mb-2 shadow-2xl z-[110]">
                <EmojiPicker width={300} height={400} onEmojiClick={handleReactionSelect} />
              </div>
            )}
          </div>

          <ActionIcon icon={<BiMessageRoundedDetail size={18}/>} label="Reply in thread" />
          
          <button onClick={triggerForward} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors group/tool">
            <MdShare size={18} />
            <Tooltip label="Forward message" />
          </button>

          <ActionIcon icon={<MdBookmarkBorder size={18}/>} label="Save" />

          <div className="relative group/tooltip" ref={menuRef}>
            <button 
              className={`p-2 rounded-md transition-colors ${showMenu ? 'bg-gray-100 text-black' : 'hover:bg-gray-100 text-gray-600'}`}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            >
              <MdMoreVert size={18} />
            </button>
            {!showMenu && <Tooltip label="More actions" />}
            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-2 z-[70] text-sm text-gray-700">
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer transition-colors text-left font-medium">Copy link</div>
                <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer transition-colors text-left font-medium text-red-600">Report message</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Tooltip and ActionIcon sub-components
const Tooltip = ({ label }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tool:block group-hover/tooltip:block z-[70]">
    <div className="bg-[#1a1d21] text-white text-[13px] font-bold py-1.5 px-3 rounded-lg whitespace-nowrap relative shadow-xl">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#1a1d21]"></div>
    </div>
  </div>
);

const ActionIcon = ({ icon, label }) => (
  <div className="relative group/tooltip">
    <button className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">{icon}</button>
    <Tooltip label={label} />
  </div>
);

export default memo(ReceiverMessage);