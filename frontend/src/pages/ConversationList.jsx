// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const ConversationList = ({ userId, onSelect }) => {
//   const [conversations, setConversations] = useState([]);

//   useEffect(() => {
//     const fetchConvs = async () => {
//       const res = await axios.get(`/api/conversation/${userId}`);
//       setConversations(res.data);
//     };
//     fetchConvs();
//   }, [userId]);

//   return (
//                    <div className="md:w-[350px] w-[200px] h-full bg-[#3f0c41] text-gray-200 flex flex-col border-r border-gray-700">
//       <h2 className="p-3 font-semibold text-lg border-b">Chats</h2>
//       {conversations.map((conv) => {
//         const friend = conv.members.find((m) => m._id !== userId);
//         return (
//           <div
//             key={conv._id}
//             onClick={() => onSelect(conv)}
//             className="p-3 hover:bg-gray-200 cursor-pointer"
//           >
//             {friend?.username || "Unknown User"}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default ConversationList;


