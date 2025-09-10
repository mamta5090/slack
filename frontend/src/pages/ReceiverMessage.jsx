import React, { memo } from "react";
import dp from "../assets/dp.webp";
import { useSelector } from "react-redux";

const ReceiverMessage = ({ message, createdAt }) => {
  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

    const singleUser=useSelector((state)=>state.user.singleUser)

  return (
    <div className="flex mb-2 justify-start">
      <div className="flex flex-row gap-2 items-start">
        {/* Receiver Profile Image */}
        <div className="rounded-xl bg-gray-500">
          <img
            src={singleUser?.profileImage || dp}
            alt="Receiver Avatar"
            className="rounded-xl h-10 w-10 object-cover"
          />
        </div>

        {/* Message bubble */}
        <div className="flex flex-col bg-gray-200 text-black px-3 py-2 rounded-lg max-w-[70%]">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-semibold">{singleUser?.name || "Unknown"}</h1>
            <p className="text-xs w-[100px] text-gray-500">{formattedTime}</p>
          </div>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default memo(ReceiverMessage);
