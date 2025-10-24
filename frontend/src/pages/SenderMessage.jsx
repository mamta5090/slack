import React, { memo } from "react";
import { useSelector } from "react-redux";
import Avatar from "../component/Avatar";

const SenderMessage = ({ message, createdAt, image }) => {
  const user = useSelector((state) => state.user.user);

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="flex mb-2">
      <div className="flex flex-row gap-2 py-3 items-start">
        {user && <Avatar user={user} size="md"  />}
        <div className="flex flex-col px-3  rounded-lg max-w-[80%] ">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-bold text-[18px]">{user?.name || "Unknown"}</h1>
            <p className="text-xs font-semibold">{formattedTime}</p>
          </div>
          {image && (
            <img 
              src={image} 
              alt="Sent content" 
              className="rounded-md mt-2 w-[380px] h-[200px]"
            />
          )}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default memo(SenderMessage);