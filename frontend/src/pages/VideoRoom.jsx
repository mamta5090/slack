import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux'; // Import useSelector to get user data
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'; // <-- THE FIX IS HERE

const VideoRoom = () => {
  const { roomID } = useParams();
  
  // Get the logged-in user's data from the Redux store
  const user = useSelector((state) => state.user.user);

  // This function will be called by the ref, and the div element will be passed to it
  const myMeeting = async (element) => {
    // Ensure the element and user data are available before proceeding
    if (!element || !user) {
      console.error("Meeting container or user data is not ready.");
      return;
    }

    const appID = 92592530; // Your App ID
    const serverSecret = "46ee7f26893cdef31d3647a6984c6d14"; // Your Server Secret
    
    // Generate the Kit Token for the Zego Cloud service
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      user._id, // Use the unique user ID for the token
      user.name // Use the dynamic user name from Redux
    );

    // Create the Zego UI Kit instance
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Join the room and configure the meeting
    zp.joinRoom({
      container: element, // The div element where the video call will be rendered
      sharedLinks: [
        {
          name: 'Copy link',
          url: `${window.location.protocol}//${window.location.host}/room/${roomID}`,
        },
      ],
      scenario: {
        // Use OneONoneCall mode for 1-on-1 calls
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false, // Optional: hide the screen sharing button for a cleaner UI
    });
  };

  return (
    <div>
      {/* The ref will pass the div element to the myMeeting function once it's rendered */}
      <div
        ref={myMeeting}
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
};

export default VideoRoom;