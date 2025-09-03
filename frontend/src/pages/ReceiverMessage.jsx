// import React from "react";

// const ReceiverMessage = ({ message, time }) => {
//   return (
//     <div className="flex items-end space-x-2 mb-2">

//       <div className="bg-gray-200 text-black px-3 py-2 rounded-lg max-w-[70%]">
//         <p className="text-sm">{message}</p>
//         <span className="text-[10px] text-gray-500 float-left">{time}</span>
//       </div>
//     </div>
//   );
// };

// export default ReceiverMessage;
import React from "react";
import { memo } from "react";

const ReceiverMessage = ({ message, createdAt }) => {
  // Format the date into a readable time string, e.g., "10:30 AM"
  const formattedTime = createdAt 
    ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : "";

  return (
    <div className="flex items-start space-x-2 mb-2">
      <div className="bg-gray-200 text-black px-3 py-2 rounded-lg max-w-[70%]">
        <p className="text-sm">{message}</p>
        <p className="text-xs text-gray-500 mt-1 text-right">{formattedTime}</p>
      </div>
    </div>
  );
};

// Wrap with React.memo for performance optimization
export default memo(ReceiverMessage);