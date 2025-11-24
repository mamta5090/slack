// // src/hook/useWebRTC.js

// import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
// import { useSelector } from 'react-redux';

// const stunServer = {
//   iceServers: [
//     {
//       urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
//     },
//   ],
// };

// let isMediaRequestInProgress = false;

// export const useWebRTC = (socket, otherUser) => {
//   const { allUsers = [] } = useSelector((state) => state.user);
//   const [callState, setCallState] = useState("idle");
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);
//   const [incomingCallData, setIncomingCallData] = useState(null);
//   const [isLocalAudioMuted, setIsLocalAudioMuted] = useState(false);
//   const [isLocalVideoMuted, setIsLocalVideoMuted] = useState(false);

//   const peerConnection = useRef(null);
//   const stateRef = useRef();

//   stateRef.current = { callState };

//   const incomingCallFrom = useMemo(() => {
//     if (!incomingCallData) return null;
//     return allUsers.find(u => u._id === incomingCallData.from);
//   }, [incomingCallData, allUsers]);

//   const cleanupCall = useCallback(() => {
//     console.log("Cleaning up call state...");
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }
//     setLocalStream(null);
//     setRemoteStream(null);
//     setCallState("idle");
//     setIncomingCallData(null);
//     isMediaRequestInProgress = false;
//     setIsLocalAudioMuted(false);
//     setIsLocalVideoMuted(false);
//   }, [localStream]);

//   // This function is for the global IncomingCallManager to use
//   const setExternalIncomingCall = useCallback((data) => {
//     if (stateRef.current.callState === 'idle' && !isMediaRequestInProgress) {
//       setIncomingCallData(data);
//       setCallState("receiving");
//     }
//   }, []);

//   const hangUp = useCallback(() => {
//     let target = otherUser;
//     if (stateRef.current.callState === 'receiving' && incomingCallData) {
//       target = allUsers.find(u => u._id === incomingCallData.from);
//     }
//     if (socket && target?._id) {
//       socket.emit('webrtc-hangup', { to: target._id });
//     }
//     cleanupCall();
//   }, [socket, otherUser, incomingCallData, allUsers, cleanupCall]);

//   const toggleAudio = useCallback(() => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsLocalAudioMuted(!audioTrack.enabled);
//       }
//     }
//   }, [localStream]);

//   const toggleVideo = useCallback(() => {
//     if (localStream) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsLocalVideoMuted(!videoTrack.enabled);
//       }
//     }
//   }, [localStream]);

//   useEffect(() => {
//     if (!socket) return;

//     // The 'webrtc-offer' listener is intentionally removed from here.
//     // It is handled globally in App.jsx.

//     const handleAnswer = async ({ answer }) => {
//       if (peerConnection.current) {
//         await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
//         setCallState("active");
//       }
//     };

//     const handleIceCandidate = async ({ candidate }) => {
//       if (peerConnection.current) {
//         try {
//           await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (e) {
//           console.error('Error adding received ice candidate', e);
//         }
//       }
//     };

//     const handleHangup = () => {
//       cleanupCall();
//     };

//     socket.on("webrtc-answer", handleAnswer);
//     socket.on("webrtc-ice-candidate", handleIceCandidate);
//     socket.on("webrtc-hangup", handleHangup);

//     return () => {
//       socket.off("webrtc-answer", handleAnswer);
//       socket.off("webrtc-ice-candidate", handleIceCandidate);
//       socket.off("webrtc-hangup", handleHangup);
//     };
//   }, [socket, cleanupCall]);

//   const startCall = async () => {
//     if (isMediaRequestInProgress) return;
//     if (!socket || !otherUser) return alert("Cannot start call.");

//     isMediaRequestInProgress = true;
//     setCallState("calling");

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);

//       const pc = new RTCPeerConnection(stunServer);
//       stream.getTracks().forEach(track => pc.addTrack(track, stream));
//       pc.ontrack = (event) => setRemoteStream(event.streams[0]);
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("webrtc-ice-candidate", { to: otherUser._id, candidate: event.candidate });
//         }
//       };
      
//       peerConnection.current = pc;
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       socket.emit("webrtc-offer", { to: otherUser._id, offer });
//     } catch (error) {
//       console.error("Error starting call:", error);
//       cleanupCall();
//     } finally {
//       isMediaRequestInProgress = false;
//     }
//   };

//   const acceptCall = async () => {
//     if (isMediaRequestInProgress) return;
//     if (!socket || !incomingCallData) return;

//     isMediaRequestInProgress = true;
//     setCallState("active");

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
//       setLocalStream(stream);
      
//       const pc = new RTCPeerConnection(stunServer);
//       stream.getTracks().forEach(track => pc.addTrack(track, stream));
//       pc.ontrack = (event) => setRemoteStream(event.streams[0]);
//       pc.onicecandidate = (event) => {
//         if (event.candidate) {
//           socket.emit("webrtc-ice-candidate", { to: incomingCallData.from, candidate: event.candidate });
//         }
//       };

//       await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));
//       const answer = await pc.createAnswer();
//       await pc.setLocalDescription(answer);
//       socket.emit("webrtc-answer", { to: incomingCallData.from, answer });
      
//       peerConnection.current = pc;
//       setIncomingCallData(null);
//     } catch (error) {
//       console.error("Error answering call:", error);
//       cleanupCall();
//     } finally {
//       isMediaRequestInProgress = false;
//     }
//   };

//   return {
//     callState,
//     localStream,
//     remoteStream,
//     startCall,
//     acceptCall,
//     hangUp,
//     incomingCallFrom,
//     isMediaRequestInProgress,
//     isLocalAudioMuted,
//     isLocalVideoMuted,
//     toggleAudio,
//     toggleVideo,
//     setExternalIncomingCall
//   };
// };
