// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux'; 
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'; 

// const VideoRoom = () => {
//   const { roomID } = useParams();
  
//   const pRef=useRef(null)
//   const user = useSelector((state) => state.user.user);
//   const selectedUser=useState((state)=>state.user.selestedUser)
  
//   const myMeeting = async (element) => {
    
//     if (!element || !user) {
//       console.error("Meeting container or user data is not ready.");
//       return;
//     }

//     const appID = 92592530; 
//     const serverSecret = "46ee7f26893cdef31d3647a6984c6d14"; 
    

//     const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//       appID,
//       serverSecret,
//       roomID,
//       user._id, 
//       user.name ,
    
//     );

    
//     const zp = ZegoUIKitPrebuilt.create(kitToken);

    
//     zp.joinRoom({
//       container: element, 
//       sharedLinks: [
//         {
//           name: 'Copy link',
//           url: `${window.location.protocol}//${window.location.host}/room/${roomID}`,
//         },
//       ],
//       scenario: {
//         mode: ZegoUIKitPrebuilt.OneONoneCall,
//       },
//       showScreenSharingButton: false, 
//     });
//   };

// useEffect(()=>{
//   const zp=ZegoUIKitPrebuilt.create(TOKEN);
//   zp.addPlugins({ZIM})
// },[TOKEN])


// function invite() {
//    const targetUser = {
//         selectedUser._id:prompt("enter callee's userId"),
//         selectedUser.name:prompt("enter callee's userName")
//     };
//    zpRef.sendCallInvitation({
//     callees: [targetUser],
//     callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
//     timeout: 60, 
//    }).then((res) => {
//     console.warn(res);
//    })
//    .catch((err) => {
//    console.warn(err);
//    });
// }
//   return (
//     <div>
   
//       <div
//         ref={myMeeting}
//         style={{ width: '100vw', height: '100vh' }}
//       />
//     </div>
//   );
// };

// export default VideoRoom;



// import React, { useEffect, useRef } from 'react';
// import { useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

// const VideoRoom = () => {
//   const { roomID } = useParams();

//   const pRef = useRef(null);
//   const zpRef = useRef(null);

//   const user = useSelector((state) => state.user && state.user.user);
//   const selectedUser = useSelector((state) => state.user && state.user.selectedUser);

//   const myMeeting = async (element) => {
//     if (!element || !user) {
//       console.error('Meeting container or user data is not ready.');
//       return;
//     }

//     const appID = 92592530; // replace with your appID
//     const serverSecret = '46ee7f26893cdef31d3647a6984c6d14'; // TEST secret — DO NOT expose in production

//     try {
//       const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//         appID,
//         serverSecret,
//         roomID,
//         user._id,
//         user.name
//       );

//       const zp = ZegoUIKitPrebuilt.create(kitToken);
//       zpRef.current = zp;

//       zp.joinRoom({
//         container: element,
//         sharedLinks: [
//           {
//             name: 'Copy link',
//             url: `${window.location.protocol}//${window.location.host}/room/${roomID}`,
//           },
//         ],
//         scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
//         showScreenSharingButton: false,
//       });
//     } catch (err) {
//       console.error('Error starting meeting:', err);
//     }
//   };

//   function invite() {
//     const zp = zpRef.current;
//     if (!zp) {
//       console.warn('Zego instance not ready');
//       return;
//     }

//     // Prefer selectedUser from Redux; fallback to prompt for quick demo
//     const calleeId = (selectedUser && selectedUser._id) || prompt("enter callee's userId");
//     const calleeName = (selectedUser && selectedUser.name) || prompt("enter callee's userName");
//     if (!calleeId) return;

//     // Adjust keys according to your SDK/server expectations (some expect { userId, userName })
//     const targetUser = { id: calleeId, name: calleeName };

//     zp.sendCallInvitation({
//       callees: [targetUser],
//       callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
//       timeout: 60,
//     })
//       .then((res) => console.warn('Invitation response:', res))
//       .catch((err) => console.warn('Invitation error:', err));
//   }

//   useEffect(() => {
//     // cleanup on unmount
//     return () => {
//       if (zpRef.current && typeof zpRef.current.destroy === 'function') {
//         try {
//           zpRef.current.destroy();
//         } catch (e) {
//           // ignore
//         }
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <div ref={myMeeting} style={{ width: '100vw', height: '100vh' }} />
//       <button
//         onClick={invite}
//         style={{
//           position: 'absolute',
//           top: 12,
//           right: 12,
//           padding: '8px 12px',
//           zIndex: 1000,
//         }}
//       >
//         Invite
//       </button>
//     </div>
//   );
// };

// export default VideoRoom;




import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoRoom = () => {
  const zpRef = useRef(null);
  const user = useSelector((state) => state.user && state.user.user);
  const selectedUser = useSelector((state) => state.user && state.user.selectedUser);

  useEffect(() => {
    if (!user) return;

    const appID = 92592530;
    const serverSecret = '46ee7f26893cdef31d3647a6984c6d14'; // TEST ONLY - don't expose in production
    // roomID not used here, pass null (or provide a roomID if you have one)
    const TOKEN = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, null, user._id, user.name);

    try {
      const zp = ZegoUIKitPrebuilt.create(TOKEN);
      zpRef.current = zp;

      // If you have ZIM plugin available on window.ZIM, register it.
      if (typeof window !== 'undefined' && window.ZIM) {
        zp.addPlugins({ ZIM: window.ZIM });
      }

      // (Optional) you can auto-join or prepare UI here if desired
    } catch (err) {
      console.error('Failed to create Zego instance:', err);
    }

    return () => {
      if (zpRef.current && typeof zpRef.current.destroy === 'function') {
        try {
          zpRef.current.destroy();
        } catch (e) {
          /* ignore cleanup errors */
        }
      }
    };
  }, [user]);

  function invite(callType) {
    const zp = zpRef.current;
    if (!zp) {
      console.warn('Zego instance not ready');
      return;
    }

    const calleeId = (selectedUser && selectedUser._id) || prompt("enter callee's userId");
    const calleeName = (selectedUser && selectedUser.name) || prompt("enter callee's userName");
    if (!calleeId) return;

    // Adjust keys here if your backend/SDK expects different names (e.g. { userId, userName })
    const targetUser = { id: calleeId, name: calleeName };

    zp.sendCallInvitation({
      callees: [targetUser],
      callType, // pass the callType from the button (video/voice)
      timeout: 60,
    })
      .then((res) => {
        console.warn('Invitation response:', res);
      })
      .catch((err) => {
        console.warn('Invitation error:', err);
      });
  }

  return (
    <div className="w-full h-screen bg-gradient-to-b from-gray-600 to-black flex items-center justify-center">
      <div className="w-[500px] h-[400px] bg-blue-950 border border-gray-600 p-6">
        <h1><span className="">UserName: </span>{user?.name || '—'}</h1>
        <h1><span>UserId: </span>{user?._id || '—'}</h1>

        <div className="mt-6 space-x-3">
          <button
            onClick={() => invite(ZegoUIKitPrebuilt.InvitationTypeVoiceCall)}
            className="px-4 py-2 bg-gray-800 rounded"
          >
            Voice call
          </button>

          <button
            onClick={() => invite(ZegoUIKitPrebuilt.InvitationTypeVideoCall)}
            className="px-4 py-2 bg-gray-800 rounded"
          >
            Video call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;


