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

const ReceiverMessage = ({ message, createdAt }) => {
  const pretty = createdAt ? new Date(createdAt).toLocaleString() : "";

  return (
    <div className="flex items-end space-x-2 mb-2">
      <div
        className="relative group bg-gray-200 text-black px-3 py-2 rounded-lg max-w-[70%]"
        title={pretty}
      >
        <p className="text-sm">{message}</p>

        {/* custom tooltip on hover */}
        <div className="absolute hidden group-hover:block text-[10px] bg-black text-white px-2 py-1 rounded shadow -bottom-6 left-0 whitespace-nowrap">
          {pretty}
        </div>
      </div>
    </div>
  );
};

export default ReceiverMessage;
