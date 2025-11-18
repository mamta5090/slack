import React, { useRef, useEffect } from 'react';
import Avatar from './Avatar';
// ✅ FIX: Corrected the icon names below
import { RiPhoneFill, RiMicFill, RiMicOffFill, RiVideoFill, RiVideoOffFill } from 'react-icons/ri';

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
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const renderContent = () => {
    // ... (no changes in this part of the code)
    if (callState === 'receiving' || callState === 'calling') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <Avatar user={otherUser} size="xl" />
          <h2 className="mt-4 text-2xl font-semibold">{otherUser?.name || 'Unknown User'}</h2>
          <p className="mt-2 text-lg">{callState === 'receiving' ? 'Incoming Call...' : 'Calling...'}</p>
          {callState === 'receiving' && (
            <div className="mt-8 flex gap-6">
              <button
                onClick={hangUp}
                className="bg-red-500 hover:bg-red-600 rounded-full p-4 transition-colors"
                title="Decline"
              >
                <RiPhoneFill className="text-2xl" />
              </button>
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 rounded-full p-4 transition-colors"
                title="Accept"
              >
                <RiPhoneFill className="text-2xl" />
              </button>
            </div>
          )}
        </div>
      );
    }

    if (callState === 'connected') {
      return (
        <div className="relative w-full h-full">
          {/* Remote Video (Fullscreen) */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover bg-gray-900" />
          
          {/* Local Video (Picture-in-Picture) */}
          <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-gray-500 shadow-lg" />

          {/* Call Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-3 rounded-full">
            <button onClick={toggleAudio} className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors" title={isLocalAudioMuted ? 'Unmute Audio' : 'Mute Audio'}>
              {isLocalAudioMuted ? <RiMicOffFill className="text-2xl text-white" /> : <RiMicFill className="text-2xl text-white" />}
            </button>
            {/* ✅ FIX: Use the corrected icon names here */}
             <button onClick={toggleVideo} className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors" title={isLocalVideoMuted ? 'Turn Camera On' : 'Turn Camera Off'}>
              {isLocalVideoMuted ? <RiVideoOffFill className="text-2xl text-white" /> : <RiVideoFill className="text-2xl text-white" />}
            </button>
            <button onClick={hangUp} className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors" title="Hang Up">
              <RiPhoneFill className="text-2xl text-white" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-90">
      {renderContent()}
    </div>
  );
};

export default VideoCallUI;