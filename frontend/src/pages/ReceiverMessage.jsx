import React from "react";

const ReceiverMessage = ({ message, time }) => {
  return (
    <div className="flex items-end space-x-2 mb-2">
    
      <div className="bg-gray-200 text-black px-3 py-2 rounded-lg max-w-[70%]">
        <p className="text-sm">{message}</p>
        <span className="text-[10px] text-gray-500 float-left">{time}</span>
      </div>
    </div>
  );
};

export default ReceiverMessage;
