// src/component/IncomingCallManager.jsx
import {React,useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useWebRTC } from '../hook/useWebRTC';
import VideoCallUI from './VideoCallUI.jsx';
import { clearIncomingCall } from '../redux/callSlice';

const IncomingCallManager = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((state) => state.socket);
  const { incomingCallData: globalIncomingCall } = useSelector((state) => state.call);

  // We still use the useWebRTC hook, but now we feed it the global call data
  const {
    callState,
    localStream,
    remoteStream,
    acceptCall,
    hangUp,
    incomingCallFrom,
    isMediaRequestInProgress,
    isLocalAudioMuted,
    isLocalVideoMuted,
    toggleAudio,
    toggleVideo,
    setExternalIncomingCall // We need to add this function to the hook
  } = useWebRTC(socket, null); // We don't need `otherUser` here initially

  // Effect to sync global Redux state with the hook's internal state
  useEffect(() => {
    if (globalIncomingCall) {
      setExternalIncomingCall(globalIncomingCall);
    }
  }, [globalIncomingCall, setExternalIncomingCall]);

  const handleAccept = () => {
    acceptCall();
    dispatch(clearIncomingCall());
  };

  const handleHangUp = () => {
    hangUp();
    dispatch(clearIncomingCall());
  };

  if (callState === 'idle') {
    return null;
  }

  return (
    <VideoCallUI
      callState={callState}
      localStream={localStream}
      remoteStream={remoteStream}
      acceptCall={handleAccept}
      hangUp={handleHangUp}
      otherUser={incomingCallFrom}
      isMediaRequestInProgress={isMediaRequestInProgress}
      isLocalAudioMuted={isLocalAudioMuted}
      isLocalVideoMuted={isLocalVideoMuted}
      toggleAudio={toggleAudio}
      toggleVideo={toggleVideo}
    />
  );
};

export default IncomingCallManager;