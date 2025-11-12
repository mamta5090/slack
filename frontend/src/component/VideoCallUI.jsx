// src/component/VideoCallUI.jsx
// This component renders the video call interface.
// It uses Tailwind CSS for styling and Framer Motion for smooth animations.
// The UI is a responsive overlay/modal with video grids, controls, and participant names.
// For 1:1 call, it shows two video feeds: local (small) and remote (large).
// In group scenarios (future), it can expand to grid.
// Assumes Tailwind and Framer Motion are installed: npm i tailwindcss framer-motion

import React from 'react';
import { motion } from 'framer-motion';
import { BsMicMute, BsMic, BsCameraVideo, BsCameraVideoOff, BsTelephoneX } from 'react-icons/bs';

const VideoCallUI = ({
  callState,
  localStream,
  remoteStream,
  acceptCall,
  hangUp,
  otherUser,
  isLocalAudioMuted,
  isLocalVideoMuted,
  toggleAudio,
  toggleVideo,
}) => {
  // Attach streams to video elements
  const localVideoRef = React.useRef(null);
  const remoteVideoRef = React.useRef(null);

  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 },
  };

  if (callState === 'receiving') {
    return (
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Incoming Call from {otherUser?.name}</h2>
          <div className="flex justify-center gap-4">
            <motion.button
              onClick={acceptCall}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Accept
            </motion.button>
            <motion.button
              onClick={hangUp}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Decline
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (callState === 'calling') {
    return (
      <motion.div
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="text-white text-xl">Calling {otherUser?.name}...</div>
        <motion.button
          onClick={hangUp}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          Cancel
        </motion.button>
      </motion.div>
    );
  }

  if (callState === 'in-call') {
    return (
      <motion.div
        className="fixed inset-0 bg-gray-900 flex flex-col z-50"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 relative">
          {/* Remote Video (Main) */}
          <motion.div
            className="relative bg-black rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
              {otherUser?.name}
            </div>
          </motion.div>

          {/* Local Video (Picture-in-Picture) */}
          <motion.div
            className="absolute bottom-4 right-4 w-32 h-32 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">You</div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4 flex justify-center gap-6">
          <motion.button
            onClick={toggleAudio}
            className="text-white p-3 rounded-full bg-gray-700 hover:bg-gray-600"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isLocalAudioMuted ? <BsMicMute size={24} /> : <BsMic size={24} />}
          </motion.button>
          <motion.button
            onClick={toggleVideo}
            className="text-white p-3 rounded-full bg-gray-700 hover:bg-gray-600"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {isLocalVideoMuted ? <BsCameraVideoOff size={24} /> : <BsCameraVideo size={24} />}
          </motion.button>
          <motion.button
            onClick={hangUp}
            className="text-white p-3 rounded-full bg-red-600 hover:bg-red-700"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <BsTelephoneX size={24} />
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return null;
};

export default VideoCallUI;