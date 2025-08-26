import React, { useEffect, useState } from "react";
import axios from "axios";

const ConversationList = ({ userId, onSelect }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConvs = async () => {
      const res = await axios.get(`http://localhost:3000/api/conversation/${userId}`);
      setConversations(res.data);
    };
    fetchConvs();
  }, [userId]);

  return (
    <div className="w-[250px] border-r h-[90vh] overflow-y-auto">
      <h2 className="p-3 font-semibold text-lg border-b">Chats</h2>
      {conversations.map((conv) => {
        const friend = conv.members.find((m) => m._id !== userId);
        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv)}
            className="p-3 hover:bg-gray-200 cursor-pointer"
          >
            {friend?.username || "Unknown User"}
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
