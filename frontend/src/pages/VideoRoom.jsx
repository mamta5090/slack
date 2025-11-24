// import React, { useEffect, useRef, useCallback, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';


// const appID = 92592530; 
// const serverSecret = '46ee7f26893cdef31d3647a6984c6d14'; 

// const VideoRoom = () => {
//   const { roomID } = useParams();
//   const containerRef = useRef(null);
//   const zpRef = useRef(null);
//   const [status, setStatus] = useState('idle');

 
//   const user = useSelector((state) => state.user?.user);
//   const selectedUser = useSelector((state) => state.user?.selectedUser);


//   const startMeeting = useCallback(() => {
//     if (!containerRef.current) {
//       console.warn('Meeting container not ready');
//       return;
//     }
//     if (!user) {
//       console.warn('User data not ready');
//       return;
//     }

   
//     if (zpRef.current && typeof zpRef.current.destroy === 'function') {
//       try {
//         zpRef.current.destroy();
//       } catch {}
//       zpRef.current = null;
//     }

//     try {
//       const uid = String(user._id || user.id || user.userId || Math.random().toString(36).slice(2));
//       const uname = String(user.name || user.userName || 'Guest');

//       const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//         appID,
//         serverSecret,
//         roomID,
//         uid,
//         uname
//       );

//       const zp = ZegoUIKitPrebuilt.create(kitToken);
//       zpRef.current = zp;

//       zp.joinRoom({
//         container: containerRef.current,
//         sharedLinks: [
//           {
//             name: 'Copy link',
//             url: `${window.location.protocol}//${window.location.host}/room/${roomID}`,
//           },
//         ],
//         scenario: { mode: ZegoUIKitPrebuilt.OneONOneCall },
//         showScreenSharingButton: false,
//       });

//       setStatus('joined');
//       console.info('Zego joinRoom finished.');
//     } catch (err) {
//       console.error('Error starting meeting:', err);
//       setStatus('join_failed');
//     }
//   }, [roomID, user]);

//   useEffect(() => {
//     startMeeting();
//     return () => {
//       if (zpRef.current && typeof zpRef.current.destroy === 'function') {
//         zpRef.current.destroy();
//         zpRef.current = null;
//         console.info('Zego instance destroyed on unmount.');
//       }
//     };
//   }, [startMeeting]);


//   function invite() {
//     const zp = zpRef.current;
//     if (!zp) {
//       console.warn('Zego instance not ready for invitation');
//       return;
//     }

//     const calleeId = selectedUser?._id || selectedUser?.userId || prompt("enter callee's userId");
//     const calleeName = selectedUser?.name || selectedUser?.userName || prompt("enter callee's userName");
//     if (!calleeId) return;

//     const target = { userId: String(calleeId), userName: String(calleeName || 'Guest') };

//     zp.sendCallInvitation({
//       callees: [target],
//       callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
//       timeout: 60,
//     })
//       .then((res) => console.info('Invitation response:', res))
//       .catch((err) => console.warn('Invitation error:', err));
//   }

//   return (
//     <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
//       <div
//         ref={containerRef}
//         style={{ width: '100%', height: '100%', background: '#0b0b0b' }}
//       />
//       <button
//         onClick={invite}
//         style={{
//           position: 'absolute',
//           top: 12,
//           right: 12,
//           padding: '8px 12px',
//           borderRadius: 6,
//           background: '#2563eb',
//           color: '#fff',
//           border: 'none',
//           cursor: 'pointer',
//           zIndex: 2000,
//         }}
//       >
//         Invite
//       </button>

//       <div style={{ position: 'absolute', bottom: 12, left: 12, color: '#fff' }}>
//         <small>Status: {status}</small>
//       </div>
//     </div>
//   );
// };

// export default VideoRoom;






// // import React, { useEffect, useRef, useState } from 'react';
// // import { useSelector } from 'react-redux';
// // import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// // const VideoRoom = () => {
// //   const zpRef = useRef(null);
// //   const [pluginReady, setPluginReady] = useState(false);
// //   const user = useSelector((state) =>state.user.user);
// //   const singleUser = useSelector((state) =>state.user.singleUser);

// //   useEffect(() => {
// //     if (!user) return;

// //     let mounted = true;
// //     const appID = 92592530;
// //     const serverSecret = '46ee7f26893cdef31d3647a6984c6d14'; 
// //     const TOKEN = ZegoUIKitPrebuilt.generateKitTokenForTest(
// //       appID,
// //       serverSecret,
// //       null,
// //       user._id,
// //       user.name
// //     );

// //     try {
// //       const zp = ZegoUIKitPrebuilt.create(TOKEN);
// //       zpRef.current = zp;
// //     } catch (err) {
// //       console.error('Failed to create Zego instance:', err);
// //       return;
// //     }

    
// //     const waitForZIM = async (timeoutMs = 10000, intervalMs = 200) => {
// //       const start = Date.now();
// //       while (mounted && Date.now() - start < timeoutMs) {
// //         if (typeof window !== 'undefined' && window.ZIM) {
// //           try {
// //             zpRef.current?.addPlugins({ ZIM: window.ZIM });
// //             setPluginReady(true);
// //             console.info('ZIM plugin registered with Zego instance.');
// //             return true;
// //           } catch (err) {
// //             console.warn('Failed to register ZIM plugin:', err);
// //             return false;
// //           }
// //         }
       
// //         await new Promise((r) => setTimeout(r, intervalMs));
// //       }
// //       return false;
// //     };

// //     waitForZIM().then((ok) => {
// //       if (!ok) {
// //         console.warn(
// //           'ZIM plugin not detected. Make sure you included the ZIM plugin (script or package) before using invitations.'
// //         );
// //       }
// //     });

// //     return () => {
// //       mounted = false;
// //       if (zpRef.current && typeof zpRef.current.destroy === 'function') {
// //         try {
// //           zpRef.current.destroy();
// //         } catch (error) {
// //           console.log('Error destroying Zego instance:', error);
// //         }
// //       }
// //     };
// //   }, [user]);

// //   async function invite(callType) {
// //     const zp = zpRef.current;
// //     if (!zp) {
// //       console.warn('Zego instance not ready');
// //       return;
// //     }

// //     if (!pluginReady) {
     
// //       console.warn('Cannot invite: ZIM plugin not registered yet.');
// //       return;
// //     }

// //     const calleeId = (singleUser && singleUser._id) || prompt("enter callee's userId");
// //     const calleeName = (singleUser && singleUser.name) || prompt("enter callee's userName");
// //     if (!calleeId) return;

  
// //     const targetUser = {
// //       id: calleeId,
// //       name: calleeName,
// //       userID: calleeId,
// //       userName: calleeName,
// //     };

// //     try {
// //       const res = await zp.sendCallInvitation({
// //         callees: [targetUser],
// //         callType,
// //         timeout: 60,
// //       });
// //       console.warn('Invitation response:', res);
// //     } catch (err) {
// //       console.warn('Invitation error:', err);
    
// //     }
// //   }

// //   return (
// //     <div className="w-full h-screen bg-gradient-to-b from-gray-600 to-black flex items-center justify-center">
// //       <div className="w-[500px] h-[400px] bg-blue-950 border border-gray-600 p-6">
// //         <h1>
// //           <span>UserName: </span>
// //           {user?.name || '—'}
// //         </h1>
// //         <h1>
// //           <span>UserId: </span>
// //           {user?._id || '—'}
// //         </h1>

// //         <div className="mt-4">
// //           {!pluginReady ? (
// //             <p className="text-yellow-300">Waiting for ZIM plugin to load... invitations disabled.</p>
// //           ) : (
// //             <p className="text-green-300">ZIM plugin loaded — invitations enabled.</p>
// //           )}
// //         </div>

// //         <div className="mt-6 space-x-3">
// //           <button
// //             onClick={() => invite(ZegoUIKitPrebuilt.InvitationTypeVoiceCall)}
// //             className="px-4 py-2 bg-gray-800 rounded"
// //             disabled={!pluginReady}
// //           >
// //             Voice call
// //           </button>

// //           <button
// //             onClick={() => invite(ZegoUIKitPrebuilt.InvitationTypeVideoCall)}
// //             className="px-4 py-2 bg-gray-800 rounded"
// //             disabled={!pluginReady}
// //           >
// //             Video call
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default VideoRoom;
