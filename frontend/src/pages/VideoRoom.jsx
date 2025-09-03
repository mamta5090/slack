import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'; 
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'; 

const VideoRoom = () => {
  const { roomID } = useParams();
  
  
  const user = useSelector((state) => state.user.user);

  
  const myMeeting = async (element) => {
    
    if (!element || !user) {
      console.error("Meeting container or user data is not ready.");
      return;
    }

    const appID = 92592530; 
    const serverSecret = "46ee7f26893cdef31d3647a6984c6d14"; 
    

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      user._id, 
      user.name 
    );

    
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    
    zp.joinRoom({
      container: element, 
      sharedLinks: [
        {
          name: 'Copy link',
          url: `${window.location.protocol}//${window.location.host}/room/${roomID}`,
        },
      ],
      scenario: {
      
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false, 
    });
  };

  return (
    <div>
   
      <div
        ref={myMeeting}
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
};

export default VideoRoom;