import React from "react";

const SenderMessage = ({ message, time }) => {
  return (
    <div className="flex justify-end mb-2">
    
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg max-w-[70%]">
        <p className="text-sm">{message}</p>
        <span className="text-[10px] text-gray-200 float-right">{time}</span>
      </div>
    </div>
  );
};

export default SenderMessage;
