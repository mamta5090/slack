import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (socket, remoteUser) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle');
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);
  const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(false);
  const [isLocalVideoMuted, setIsLocalVideoMuted] = useState(false);

  const peerConnectionRef = useRef(null);
  const offerRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.user);

  const cleanupCall = useCallback(() => {
    console.log('[WebRTC] cleanupCall triggered.');
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setIncomingCallFrom(null);
    offerRef.current = null;
    setIsLocalAudioMuted(false);
    setIsLocalVideoMuted(false);
  }, [localStream]);

  const initializePeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        const targetUser = callState === 'calling' ? remoteUser : incomingCallFrom;
        if (targetUser?._id) {
          socket.emit('webrtc:ice-candidate', { to: targetUser._id, candidate: event.candidate });
        }
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, callState, remoteUser, incomingCallFrom]);

  const startCall = useCallback(async () => {
    if (callState !== 'idle') {
      console.warn(`[WebRTC] startCall ignored: callState is already "${callState}".`);
      return;
    }
    console.log('[WebRTC] Attempting to start call...');

    if (!socket || !remoteUser) {
        console.error("[WebRTC] Cannot start call, socket or remoteUser is missing.");
        return;
    };

    try {
      setCallState('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log(`[WebRTC] Emitting webrtc:start-call to ${remoteUser.name}`);
      socket.emit('webrtc:start-call', {
        to: remoteUser._id,
        from: currentUser,
        offer: offer,
      });
      console.log('[WebRTC] Call initiated successfully.');
    } catch (error) {
      console.error("[WebRTC] Error in startCall:", error);
      cleanupCall(); // This was being triggered by the second call attempt
    }
  }, [socket, remoteUser, currentUser, callState, initializePeerConnection, cleanupCall]);

  const acceptCall = useCallback(async () => {
    console.log('[WebRTC] Attempting to accept call...');
    if (!socket || !incomingCallFrom || !offerRef.current) return;
    try {
      setCallState('connecting'); // Intermediate state
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      await pc.setRemoteDescription(new RTCSessionDescription(offerRef.current));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log(`[WebRTC] Emitting webrtc:answer-call to ${incomingCallFrom.name}`);
      socket.emit('webrtc:answer-call', {
        to: incomingCallFrom._id,
        from: currentUser,
        answer: answer,
      });

      setCallState('connected');
    } catch (error) {
      console.error("Error accepting call:", error);
      cleanupCall();
    }
  }, [socket, incomingCallFrom, currentUser, initializePeerConnection, cleanupCall]);

  const hangUp = useCallback(() => {
    const targetUser = (callState === 'connected' || callState === 'calling' || callState === 'connecting') ? remoteUser : incomingCallFrom;
    if (socket && targetUser) {
        console.log(`[WebRTC] Emitting webrtc:hang-up to ${targetUser.name}`);
        socket.emit('webrtc:hang-up', { to: targetUser._id });
    }
    cleanupCall();
  }, [socket, remoteUser, incomingCallFrom, callState, cleanupCall]);

  const toggleAudio = useCallback(() => { /* ... no changes ... */ }, [localStream]);
  const toggleVideo = useCallback(() => { /* ... no changes ... */ }, [localStream]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, offer }) => {
      console.log(`[WebRTC] Event received: webrtc:incoming-call from ${from.name}`);
      if (callState === 'idle') {
          setIncomingCallFrom(from);
          offerRef.current = offer;
          setCallState('receiving');
      } else {
          console.warn(`[WebRTC] Ignored incoming call from ${from.name} because already in a call.`);
          // Optionally, emit a 'busy' signal back to the caller
          // socket.emit('webrtc:busy', { to: from._id });
      }
    };

    const handleCallAnswered = async ({ answer }) => {
      console.log(`[WebRTC] Event received: webrtc:call-answered`);
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState('connected');
      }
    };

    const handleIceCandidate = async ({ candidate }) => { /* ... no changes ... */ };
    const handleHangUp = () => {
        console.log('[WebRTC] Event received: webrtc:hang-up');
        cleanupCall();
    };

    socket.on('webrtc:incoming-call', handleIncomingCall);
    socket.on('webrtc:call-answered', handleCallAnswered);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:hang-up', handleHangUp);

    return () => {
      socket.off('webrtc:incoming-call', handleIncomingCall);
      socket.off('webrtc:call-answered', handleCallAnswered);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:hang-up', handleHangUp);
    };
  }, [socket, callState, cleanupCall]);

  useEffect(() => () => cleanupCall(), [cleanupCall]);

  return { callState, localStream, remoteStream, startCall, acceptCall, hangUp, incomingCallFrom, isLocalAudioMuted, isLocalVideoMuted, toggleAudio, toggleVideo };
};