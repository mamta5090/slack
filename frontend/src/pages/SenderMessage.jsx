

// export default SenderMessage;
import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

const SenderMessage = ({ message, createdAt }) => {
  const { messages } = useSelector((state) => state.message);
  const scroll = useRef();

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pretty = createdAt ? new Date(createdAt).toLocaleString() : "";

  return (
    <div className="flex justify-end mb-2" ref={scroll}>
      {/* bubble with hover tooltip */}
      <div
        className="relative group bg-green-500 text-white px-3 py-2 rounded-lg max-w-[70%]"
        title={pretty}
      >
        <p className="text-sm">{message}</p>

        {/* custom tooltip on hover */}
        <div className="absolute hidden group-hover:block text-[10px] bg-black text-white px-2 py-1 rounded shadow -bottom-6 right-0 whitespace-nowrap">
          {pretty}
        </div>
      </div>
    </div>
  );
};

export default SenderMessage;
