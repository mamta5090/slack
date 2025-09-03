import React, { memo } from "react";

const SenderMessage = ({ message, createdAt }) => {
  // Format the date into a readable time string, e.g., "10:30 AM"
  const formattedTime = createdAt
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "";

  return (
    <div className="flex justify-end mb-2">
      <div className="bg-green-500 text-white px-3 py-2 rounded-lg max-w-[70%]">
        <p className="text-sm">{message}</p>
        <p className="text-xs text-purple-200 mt-1 text-right">{formattedTime}</p>
      </div>
    </div>
  );
};

// Wrap with React.memo for performance optimization
export default memo(SenderMessage);