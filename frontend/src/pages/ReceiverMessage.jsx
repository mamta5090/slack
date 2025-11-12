import React, { memo } from "react";
import dp from "../assets/dp.webp";
import { useSelector } from "react-redux";
import Avatar from "../component/Avatar";

const ReceiverMessage = ({ message, createdAt, image, isDeleted }) => {
  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  const singleUser = useSelector((state) => state.user.singleUser);
  const user = useSelector((state) => state.user.user);
  const displayUser = singleUser || user;

  if (isDeleted) {
    return (
      <div className="text-gray-400 italic text-sm">
        This message was deleted
      </div>
    );
  }

  return (
    <div className="flex mb-2 ">
      <div className="flex flex-row gap-2 py-3 items-start">
        {singleUser && <Avatar user={singleUser} size="md" />}

        <div className="flex flex-1 flex-col px-3 rounded-lg max-w-[80%]">
          <div className="flex items-center justify-between gap-4">
            <h1 className="font-bold text-[18px]">{displayUser?.name || "Unknown"}</h1>
            <p className="text-xs font-semibold">{formattedTime}</p>
          </div>
          {image && (
            <img
              src={image}
              alt="Received content"
              className="rounded-md mt-2 w-[380px] h-[200px]"
            />
          )}
          {message && <p className="text-sm mt-1">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default memo(ReceiverMessage);