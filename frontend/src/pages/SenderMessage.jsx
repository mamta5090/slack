import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const SenderMessage = ({ message, time }) => {
  const user = useSelector((state) => state.user.user); // user from userSlice
  const { messages } = useSelector((state) => state.message); // messages from messageSlice

  const scroll = useRef();

  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // scrolls when new messages come

  return (
    <div className="flex justify-end mb-2 relative" ref={scroll}>
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg max-w-[70%] relative mt-5">
        <p className="text-sm">{message}</p>
        <span className="text-[10px] text-gray-200 float-right">{time}</span>
      </div>

      {/* Avatar */}
      <div className="absolute right-3 -bottom-7">
        {user ? (
          <div className="w-[35px] h-[35px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-[35px] h-[35px] flex items-center justify-center rounded-full bg-gray-600" />
        )}
      </div>
    </div>
  );
};

export default SenderMessage;
