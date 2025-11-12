import React, { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../component/Avatar";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

// CORRECT IMPORT
import { removeChannelMessage } from "../redux/channelMessageSlice";

const SenderMessage = ({ message, createdAt, image, messageId, channelId }) => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const handleDelete = async () => {
    if (!messageId || !channelId) {
      console.error("Missing messageId or channelId");
      return;
    }

    if (!window.confirm("Delete this message?")) return;

    try {
      await axios.delete(`/api/channel/${channelId}/messages/${messageId}`, {
        withCredentials: true,
      });

      dispatch(removeChannelMessage(messageId));
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