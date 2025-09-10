// src/components/CallUserButton.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Phone, PhoneOff } from "lucide-react";

function makeRoomId() {
  return `room_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

const CallUserButton = ({ calleeId, calleeName, calleeAvatar }) => {
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [calling, setCalling] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const onAnswered = (payload) => {
      setCalling(false);
      clearTimeout(timer);
      if (payload.accepted) {
        navigate(`/room/${payload.roomID}`);
      } else {
        alert("Call rejected or timed out");
      }
    };

    socket.on("call-answered", onAnswered);
    socket.on("call-error", (err) => {
      setCalling(false);
      clearTimeout(timer);
      alert(err.message || "Call error");
    });

    return () => {
      socket.off("call-answered", onAnswered);
      socket.off("call-error");
    };
  }, [socket, navigate, timer]);

  const startCall = () => {
    if (!socket || !user) {
      alert("Socket or user not ready");
      return;
    }
    const roomID = makeRoomId();
    const payload = {
      to: calleeId,
      from: { id: user._id, name: user.name },
      roomID,
    };
    socket.emit("call-user", payload);
    setCalling(true);

    const t = setTimeout(() => {
      setCalling(false);
      alert("No response");
    }, 30000);
    setTimer(t);
  };

  const cancelCall = () => {
    setCalling(false);
    clearTimeout(timer);
    socket.emit("call-cancelled", { to: calleeId });
  };

  return (
    <>
      {!calling ? (
        <button
          onClick={startCall}
          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium shadow-md flex items-center gap-2"
        >
          <Phone size={18} />
          Call {calleeName || "User"}
        </button>
      ) : (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center gap-4 animate-fadeIn">
            <img
              src={calleeAvatar || "https://via.placeholder.com/100"}
              alt="callee"
              className="w-20 h-20 rounded-full object-cover border-4 border-green-500 animate-pulse"
            />
            <h2 className="text-lg font-semibold text-gray-800">
              Calling {calleeName || "User"}...
            </h2>
            <p className="text-sm text-gray-500">Waiting for response</p>

            <div className="flex gap-4 mt-4">
              <button
                onClick={cancelCall}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
              >
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CallUserButton;
