import { useEffect } from "react";
import { useSelector } from "react-redux";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; 

const useListenMessages = () => {
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user); 

  useEffect(() => {
    if (!socket || !user) return;
    
    const handleNotificationSound = (payload) => {
        // --- DEBUG LOGS ---
        console.log("🔔 Incoming Message Payload:", payload);
        console.log("👤 Current User DND Info:", {
            pausedUntil: user.notificationPausedUntil,
            mode: user.notificationPauseMode,
            statusPause: user.status?.pauseNotifications
        });

        const now = new Date().getTime();
        const pausedUntilTime = user.notificationPausedUntil ? new Date(user.notificationPausedUntil).getTime() : 0;
        
        // 1. Determine if DND is active (Time check + Boolean check)
        // We check both the date and the boolean in user.status for extra safety
        const isTimePaused = pausedUntilTime > now;
        const isDNDActive = isTimePaused || user.status?.pauseNotifications;

        if (isDNDActive) {
            // 2. Logic for "Pause for Everyone"
            // We use '|| !user.notificationPauseMode' as a fallback in case it's not set
            if (!user.notificationPauseMode || user.notificationPauseMode === 'everyone') {
                console.log("🔕 Muted: DND is active for everyone.");
                return; 
            }

            // 3. Logic for "Pause except VIPs"
            if (user.notificationPauseMode === 'except_vips') {
                // Determine sender ID carefully from various payload structures
                // newMessage structure (DM): payload.newMessage.sender._id
                // channelNotification structure: payload.senderId or payload.sender._id
                const senderId = 
                    payload.newMessage?.sender?._id || 
                    payload.newMessage?.sender || 
                    payload.senderId || 
                    payload.sender?._id;
                
                const isVIP = user.vips?.some(vipId => String(vipId) === String(senderId));
                
                if (!isVIP) {
                    console.log("🔕 Muted: Sender is not a VIP.");
                    return; 
                }
                console.log("🌟 Sound playing: Sender is a VIP!");
            }
        }

        // 4. Final check: Only play if NOT in the current active chat 
        // (Optional: You might want to prevent sound if the user is already looking at the message)
        
        console.log("🔊 Playing Sound...");
        const sound = new Audio(NOTIFICATION_SOUND_URL);
        sound.play().catch(err => console.error("Audio Error (Browser likely blocked auto-play):", err));
    };

    socket.on("newMessage", handleNotificationSound);
    socket.on("channelNotification", handleNotificationSound);

    return () => {
        socket.off("newMessage", handleNotificationSound);
        socket.off("channelNotification", handleNotificationSound);
    };
  }, [socket, user]); // Crucial: Re-runs when user object (DND settings) updates in Redux
};

export default useListenMessages;