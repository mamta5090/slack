// src/component/CallNotification.jsx
<<<<<<< HEAD
import { useSelector, useDispatch } from 'react-redux';
import { clearIncomingCall } from '../redux/callSlice';
import { useWebRTC } from '../hook/useWebRTC';

const CallNotification = () => {
  const dispatch = useDispatch();
  const { incomingCallData } = useSelector((state) => state.call);
  const { socket } = useSelector((state) => state.socket);
  const targetUser = { _id: incomingCallData?.caller.id };

  const {
    acceptCall,
    hangUp,
    callState,
  } = useWebRTC(socket, targetUser);

  if (!incomingCallData || callState !== 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2">Incoming Call</h2>
        <p className="text-lg mb-6">{incomingCallData.caller.name}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              acceptCall();
              dispatch(clearIncomingCall());
            }}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={() => {
              hangUp();
              dispatch(clearIncomingCall());
            }}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
=======
import React from "react";
import { motion } from "framer-motion";
import { FaPhone, FaPhoneSlash } from "react-icons/fa";

const CallNotification = ({ visible, callerName, onAccept, onReject, outgoing }) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="bg-white shadow-xl rounded-2xl p-4 w-72 border border-gray-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold text-white">
            {callerName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">
              {outgoing ? `Calling ${callerName}` : `${callerName} is calling…`}
            </h3>
            <p className="text-sm text-gray-500">
              {outgoing ? "Ringing…" : "Incoming video call"}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-2">
          {!outgoing && (
            <button
              onClick={onAccept}
              className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition"
            >
              <FaPhone className="w-4 h-4" /> Accept
            </button>
          )}
          <button
            onClick={onReject}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition"
          >
            <FaPhoneSlash className="w-4 h-4" /> {outgoing ? "Cancel" : "Reject"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CallNotification;
>>>>>>> a0a36cbe0266d35f40b275bd487b488685f8f218
