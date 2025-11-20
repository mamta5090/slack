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
  const iceCandidateBuffer = useRef([]);
  const isProcessingCall = useRef(false);
  const callTimeoutRef = useRef(null);
  const { user: currentUser } = useSelector((state) => state.user);

  const cleanupCall = useCallback(() => {
    console.log('[WebRTC] cleanupCall triggered.');
    
    // Clear any pending timeouts
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    
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
    iceCandidateBuffer.current = [];
    isProcessingCall.current = false;
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
      console.log('[WebRTC] Remote track received');
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        console.log('[WebRTC] Peer connection established successfully!');
        isProcessingCall.current = false;
        // Clear call timeout since connection succeeded
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
        }
      } else if (pc.connectionState === 'disconnected') {
        console.log('[WebRTC] Peer connection disconnected');
      } else if (pc.connectionState === 'failed') {
        console.error('[WebRTC] Peer connection failed');
        // Only cleanup if we were trying to connect
        if (isProcessingCall.current) {
          alert('Connection failed. Please try again.');
        }
      } else if (pc.connectionState === 'closed') {
        console.log('[WebRTC] Peer connection closed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        console.log('[WebRTC] ICE connection established!');
      } else if (pc.iceConnectionState === 'failed') {
        console.error('[WebRTC] ICE connection failed');
        // Don't auto-cleanup, let user manually hang up
      } else if (pc.iceConnectionState === 'disconnected') {
        console.warn('[WebRTC] ICE connection disconnected');
        // Don't auto-cleanup, connection might recover
      }
    };

    pc.onnegotiationneeded = async () => {
      console.log('[WebRTC] Negotiation needed event fired');
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [socket, callState, remoteUser, incomingCallFrom]);

  const startCall = useCallback(async () => {
    if (callState !== 'idle') {
      console.warn(`[WebRTC] startCall ignored: callState is already "${callState}".`);
      return;
    }
    
    if (isProcessingCall.current) {
      console.warn('[WebRTC] startCall ignored: already processing a call.');
      return;
    }
    
    console.log('[WebRTC] Attempting to start call...');

    if (!socket || !remoteUser) {
        console.error("[WebRTC] Cannot start call, socket or remoteUser is missing.");
        return;
    }

    isProcessingCall.current = true;
    
    try {
      setCallState('calling');
      
      // Check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');
      
      console.log(`[WebRTC] Available devices - Video: ${hasVideo}, Audio: ${hasAudio}`);
      
      // Request media with fallback
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: hasVideo ? { width: 1280, height: 720 } : false, 
          audio: hasAudio ? { echoCancellation: true, noiseSuppression: true } : false 
        });
      } catch (mediaError) {
        console.warn('[WebRTC] Failed to get preferred media, trying audio only...', mediaError);
        // Fallback to audio only if video fails
        if (hasAudio) {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        } else {
          throw new Error('No audio or video devices available');
        }
      }
      
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
      
      // Set 60 second timeout for unanswered call
      callTimeoutRef.current = setTimeout(() => {
        if (callState === 'calling') {
          console.log('[WebRTC] Call timeout - no answer received');
          alert('Call was not answered');
          cleanupCall();
        }
      }, 60000);
    } catch (error) {
      console.error("[WebRTC] Error in startCall:", error);
      
      // User-friendly error messages
      if (error.name === 'NotFoundError' || error.message.includes('devices available')) {
        alert('No camera or microphone found. Please connect a device and try again.');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera/microphone access denied. Please allow permissions and try again.');
      } else if (error.name === 'NotReadableError') {
        alert('Your camera/microphone is being used by another application. Please close it and try again.');
      } else {
        alert(`Failed to start call: ${error.message}`);
      }
      
      isProcessingCall.current = false;
      cleanupCall();
    }
  }, [socket, remoteUser, currentUser, callState, initializePeerConnection, cleanupCall]);

  const acceptCall = useCallback(async () => {
    console.log('[WebRTC] Attempting to accept call...');
    if (!socket || !incomingCallFrom || !offerRef.current) {
      console.error('[WebRTC] Cannot accept call: missing socket, incomingCallFrom, or offer');
      return;
    }
    
    if (isProcessingCall.current) {
      console.warn('[WebRTC] acceptCall ignored: already processing a call.');
      return;
    }
    
    isProcessingCall.current = true;
    
    try {
      setCallState('connecting');
      
      // Check if devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      const hasAudio = devices.some(device => device.kind === 'audioinput');
      
      console.log(`[WebRTC] Available devices - Video: ${hasVideo}, Audio: ${hasAudio}`);
      
      // Request media with fallback
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: hasVideo ? { width: 1280, height: 720 } : false, 
          audio: hasAudio ? { echoCancellation: true, noiseSuppression: true } : false 
        });
      } catch (mediaError) {
        console.warn('[WebRTC] Failed to get preferred media, trying audio only...', mediaError);
        // Fallback to audio only if video fails
        if (hasAudio) {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        } else {
          throw new Error('No audio or video devices available');
        }
      }
      
      setLocalStream(stream);

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      await pc.setRemoteDescription(new RTCSessionDescription(offerRef.current));
      
      // Process buffered ICE candidates
      if (iceCandidateBuffer.current.length > 0) {
        console.log(`[WebRTC] Processing ${iceCandidateBuffer.current.length} buffered ICE candidates`);
        for (const candidate of iceCandidateBuffer.current) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error('[WebRTC] Error adding buffered ICE candidate:', e);
          }
        }
        iceCandidateBuffer.current = [];
      }
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log(`[WebRTC] Emitting webrtc:answer-call to ${incomingCallFrom.name}`);
      socket.emit('webrtc:answer-call', {
        to: incomingCallFrom._id,
        from: currentUser,
        answer: answer,
      });

      setCallState('connected');
      isProcessingCall.current = false;
    } catch (error) {
      console.error("[WebRTC] Error accepting call:", error);
      
      // User-friendly error messages
      if (error.name === 'NotFoundError' || error.message.includes('devices available')) {
        alert('No camera or microphone found. Please connect a device and try again.');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Camera/microphone access denied. Please allow permissions and try again.');
      } else if (error.name === 'NotReadableError') {
        alert('Your camera/microphone is being used by another application. Please close it and try again.');
      } else {
        alert(`Failed to accept call: ${error.message}`);
      }
      
      isProcessingCall.current = false;
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

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsLocalAudioMuted(!audioTrack.enabled);
        console.log(`[WebRTC] Audio ${audioTrack.enabled ? 'unmuted' : 'muted'}`);
      }
    }
  }, [localStream]);
  
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsLocalVideoMuted(!videoTrack.enabled);
        console.log(`[WebRTC] Video ${videoTrack.enabled ? 'enabled' : 'disabled'}`);
      }
    }
  }, [localStream]);

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
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          
          // Process buffered ICE candidates
          if (iceCandidateBuffer.current.length > 0) {
            console.log(`[WebRTC] Processing ${iceCandidateBuffer.current.length} buffered ICE candidates`);
            for (const candidate of iceCandidateBuffer.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (e) {
                console.error('[WebRTC] Error adding buffered ICE candidate:', e);
              }
            }
            iceCandidateBuffer.current = [];
          }
          
          setCallState('connected');
          isProcessingCall.current = false;
        } catch (error) {
          console.error('[WebRTC] Error in handleCallAnswered:', error);
          cleanupCall();
        }
      }
    };

    const handleIceCandidate = async ({ candidate }) => {
      console.log('[WebRTC] Received ICE candidate');
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('[WebRTC] ICE candidate added successfully');
        } catch (e) {
          console.error('[WebRTC] Error adding ICE candidate:', e);
        }
      } else {
        console.log('[WebRTC] Buffering ICE candidate (no remote description yet)');
        iceCandidateBuffer.current.push(candidate);
      }
    };
    const handleHangUp = () => {
        console.log('[WebRTC] Event received: webrtc:hang-up');
        cleanupCall();
    };

    const handleUserOffline = () => {
      console.log('[WebRTC] Event received: webrtc:user-offline');
      alert('User is offline or not available');
      cleanupCall();
    };

    socket.on('webrtc:incoming-call', handleIncomingCall);
    socket.on('webrtc:call-answered', handleCallAnswered);
    socket.on('webrtc:ice-candidate', handleIceCandidate);
    socket.on('webrtc:hang-up', handleHangUp);
    socket.on('webrtc:user-offline', handleUserOffline);

    return () => {
      socket.off('webrtc:incoming-call', handleIncomingCall);
      socket.off('webrtc:call-answered', handleCallAnswered);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
      socket.off('webrtc:hang-up', handleHangUp);
      socket.off('webrtc:user-offline', handleUserOffline);
    };
  }, [socket, callState, cleanupCall]);

  useEffect(() => {
    // Only cleanup on component unmount, not on every render
    return () => {
      console.log('[WebRTC] useWebRTC hook unmounting, cleaning up...');
      if (callState !== 'idle') {
        cleanupCall();
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  return { callState, localStream, remoteStream, startCall, acceptCall, hangUp, incomingCallFrom, isLocalAudioMuted, isLocalVideoMuted, toggleAudio, toggleVideo };
};