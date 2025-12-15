import { useEffect } from "react";
import { useSelector } from "react-redux";
import { setMessages } from "../redux/messageSlice"; 
import { useDispatch } from "react-redux";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; 
const useListenMessages = () => {
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user); 
  const dispatch = useDispatch();

 useEffect(() => {
    if (!socket) return;
    
    const handleNewMessage = (newMessage) => {
        // DEBUG LOGS
        console.log("📨 Message Received");
        console.log("👤 Current User DND Setting:", user?.notificationPausedUntil);
        
        const now = new Date();
        const pausedUntil = user?.notificationPausedUntil ? new Date(user.notificationPausedUntil) : null;
        
        console.log("🕒 Time Check:", { now, pausedUntil, isPaused: pausedUntil && now < pausedUntil });

        const isMuted = pausedUntil && now < pausedUntil;

        if (isMuted) {
            console.log("🔕 Muted! No sound.");
            return; 
        }

        console.log("🔊 Playing Sound...");
        const sound = new Audio(NOTIFICATION_SOUND_URL);
        sound.play().catch(err => console.error("Audio Error:", err));
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
        socket.off("newMessage", handleNewMessage);
    };
}, [socket, user]);
};

export default useListenMessages;