import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../component/Avatar";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

// channel slice action (keeps existing behavior for channels)
import { removeChannelMessage } from "../redux/channelMessageSlice";
// NOTE: make sure you have a messageSlice with a removeMessage action for DMs
import { removeMessage } from "../redux/messageSlice";

const SenderMessage = ({ message, createdAt, image, messageId, channelId }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const handleDelete = async () => {
    if (!messageId) {
      console.error("Missing messageId");
      return;
    }

    if (!window.confirm("Delete this message?")) return;

    try {
      if (channelId) {
        // channel message delete (existing behavior)
        await axios.delete(`/api/channel/${channelId}/messages/${messageId}`, {
          withCredentials: true, // or use Authorization header if you use tokens
        });
        dispatch(removeChannelMessage(messageId));
      } else {
        // personal DM delete
        // Use the message route you'll register on the backend (see below)
        await axios.delete(`/api/message/delete/${messageId}`, {
          withCredentials: true,
        });
        // dispatch action to remove message from messages slice
        // Ensure removeMessage exists in your messageSlice
        dispatch(removeMessage(messageId));
      }
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      alert("Failed to delete message");
    }
  };

  return (
    <div
      className="flex mb-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-row gap-2 py-3 items-start">
        {user && <Avatar user={user} size="md" />}
        <div className="flex flex-col px-3 rounded-lg max-w-[80%]">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-bold text-[18px]">{user?.name || "Unknown"}</h1>
            <p className="text-xs font-semibold">{formattedTime}</p>
          </div>
          {image && (
            <img src={image} alt="Sent content" className="rounded-md mt-2 w-[380px] h-[200px]" />
          )}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>

      {isHovered && (
        <div onClick={handleDelete} className="flex items-center justify-center p-2 cursor-pointer" title="Delete message">
          <FaTrash className="text-gray-500 hover:text-red-500" />
        </div>
      )}
    </div>
  );
};

export default memo(SenderMessage);
