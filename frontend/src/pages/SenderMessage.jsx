import React, { memo } from "react";
import { useSelector } from "react-redux";
import dp from "../assets/dp.webp";
import Avatar from "../component/Avatar";

const SenderMessage = ({ message, createdAt }) => {
  const user = useSelector((state) => state.user.user);

  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="flex mb-2">
      <div className="flex flex-row gap-2 items-start">
      
       {/* <div className="rounded-xl bg-gray-500">
         <img
          src={Avatar || dp}
          alt="User Avatar"
          className="rounded-xl h-10 w-10 object-cover"
        />
       </div> */}

       {user && <Avatar user={user} size="md" />}

      
        <div className="flex flex-col px-3 py-2 rounded-lg max-w-[70%]">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-semibold">{user?.name || "Unknown"}</h1>
            <p className="text-xs w-[100px] text-gray-400">{formattedTime}</p>
          </div>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};


export default memo(SenderMessage);
