// src/hook/useWebRTC.js
import { useEffect, useRef, useState } from 'react';

export const useWebRTC = (socket, targetUser) => {
  const [callState, setCallState] = useState('idle');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCallFrom, setIncomingCallFrom] = useState(null);
  const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(false);
  const [isLocalVideoMuted, setIsLocalVideoMuted] = useState(false);

  const peerConnection = useRef(null);
  const localStreamRef = useRef(null);

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  useEffect(() => {
    if (!socket || !targetUser?._id) return;

    peerConnection.current = new RTCPeerConnection({ iceServers });

    peerConnection.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          to: targetUser._id,
          candidate: event.candidate,
        });
      }
    };

    return () => {
      if (peerConnection.current) peerConnection.current.close();
      stopMediaTracks();
    };
  }, [socket, targetUser?._id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = ({ from, signal }) => {
      setIncomingCallFrom(from);
      setCallState('receiving');
      peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
    };

    const handleCallAccepted = ({ signal }) => {
      peerConnection.current.setRemoteDescription(new RTCSessionDescription(signal));
      setCallState('in-call');
    };

    const handleIceCandidate = ({ candidate }) => {
      if (candidate) {
        peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleHangUp = () => {
      endCall();
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('hang-up', handleHangUp);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('hang-up', handleHangUp);
    };
  }, [socket]);

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
    stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
  };

  const startCall = async () => {
    setCallState('calling');
    await getLocalStream();
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit('outgoing-call', {
      from: { id: socket.handshake.query.userId, name: targetUser.name },
      to: targetUser._id,
      signal: offer,
    });
  };

  const acceptCall = async () => {
    setCallState('in-call');
    await getLocalStream();
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);

    socket.emit('accept-call', {
      from: socket.handshake.query.userId,
      to: incomingCallFrom.id,
      signal: answer,
    });
  };

  const hangUp = () => {
    socket.emit('hang-up', {
      from: socket.handshake.query.userId,
      to: targetUser?._id || incomingCallFrom?.id,
    });
    endCall();
  };

  const endCall = () => {
    setCallState('idle');
    setIncomingCallFrom(null);
    stopMediaTracks();
    setRemoteStream(null);
    setLocalStream(null);
  };

  const stopMediaTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audio = localStream.getAudioTracks()[0];
      audio.enabled = !audio.enabled;
      setIsLocalAudioMuted(!audio.enabled);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const video = localStream.getVideoTracks()[0];
      video.enabled = !video.enabled;
      setIsLocalVideoMuted(!video.enabled);
    }
  };

  return {
    callState,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    hangUp,
    incomingCallFrom,
    isLocalAudioMuted,
    isLocalVideoMuted,
    toggleAudio,
    toggleVideo,
  };
};