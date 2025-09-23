import React, { useEffect, useRef, useCallback, useState } from 'react';
setStatus('join_failed');
}
}, [roomID, user]);


useEffect(() => {
// only attempt to start when user is available
if (user) startMeeting();


return () => {
if (zpRef.current && typeof zpRef.current.destroy === 'function') {
zpRef.current.destroy();
zpRef.current = null;
console.info('Zego instance destroyed on unmount.');
}
};
}, [startMeeting, user]);


function invite() {
const zp = zpRef.current;
if (!zp) {
console.warn('Zego instance not ready for invitation');
return;
}


const calleeId = selectedUser?._id || selectedUser?.userId || prompt("enter callee's userId");
const calleeName = selectedUser?.name || selectedUser?.userName || prompt("enter callee's userName");
if (!calleeId) return;


const target = { userId: String(calleeId), userName: String(calleeName || 'Guest') };


zp.sendCallInvitation({
callees: [target],
callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
timeout: 60,
})
.then((res) => console.info('Invitation response:', res))
.catch((err) => console.warn('Invitation error:', err));
}


return (
<div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
<div
ref={containerRef}
style={{ width: '100%', height: '100%', background: '#0b0b0b' }}
/>
<button
onClick={invite}
style={{
position: 'absolute',
top: 12,
right: 12,
padding: '8px 12px',
borderRadius: 6,
background: '#2563eb',
color: '#fff',
border: 'none',
cursor: 'pointer',
zIndex: 2000,
}}
>
Invite
</button>


<div style={{ position: 'absolute', bottom: 12, left: 12, color: '#fff' }}>
<small>Status: {status}</small>
</div>
</div>
);
};


export default VideoRoom;