import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { serverURL } from "../main";
import { isManualPauseActive, isOutsideNotificationSchedule } from "../../../backend/config/notificationHelper.js";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"; 

const useListenMessages = () => {
  const { socket } = useSelector((state) => state.socket);
  const { user } = useSelector((state) => state.user); 
  const [preferences, setPreferences] = useState(null);

  // Fetch preferences when user changes to get the "muteAll" and "schedule" settings
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        if (user?._id) {
          const res = await axios.get(`${serverURL}/api/preferences/${user._id}`);
          setPreferences(res.data);
        }
      } catch (err) {
        console.error("Hook: Error fetching preferences", err);
      }
    };
    fetchPrefs();
  }, [user?._id]);

  useEffect(() => {
    if (!socket || !user) return;
    
    const handleNotificationSound = (payload) => {
        const now = new Date().getTime();
        
        // --- 1. PREFERENCE CHECK: MUTE ALL ---
        const isMutedByPreference = preferences?.notifications?.sounds?.muteAll === true;
        if (isMutedByPreference) {
            console.log("🔕 Muted: User enabled 'Mute all messaging sounds' in preferences.");
            return;
        }

        // --- 2. SCHEDULE CHECK ---
        const isOutsideSchedule = isOutsideNotificationSchedule(preferences);
        
        // --- 3. MANUAL PAUSE (DND) CHECK ---
        const isManualPaused = isManualPauseActive(user);

        // --- 4. VIP EXCEPTION LOGIC ---
        // Even if paused, play if it's a VIP and the user wants VIP notifications
        const isVipMessageSettingOn = preferences?.notifications?.messagingDefaults?.vipMessages === true;
        const senderId = payload.newMessage?.sender?._id || payload.newMessage?.sender || payload.senderId;
        const isSenderVip = user.vips?.some(vipId => String(vipId) === String(senderId));

        if (isOutsideSchedule || isManualPaused) {
            if (isVipMessageSettingOn && isSenderVip) {
                console.log("🌟 VIP Sound playing despite DND/Schedule.");
            } else {
                console.log("🔕 Muted: User is outside schedule or in manual DND.");
                return;
            }
        }

        // --- 5. PLAY SOUND ---
        console.log("🔊 Playing Sound...");
        const sound = new Audio(NOTIFICATION_SOUND_URL);
        sound.play().catch(err => console.error("Audio blocked:", err));
    };

    socket.on("newMessage", handleNotificationSound);
    socket.on("channelNotification", handleNotificationSound);

    return () => {
        socket.off("newMessage", handleNotificationSound);
        socket.off("channelNotification", handleNotificationSound);
    };
  }, [socket, user, preferences]); // Re-run if preferences change
};

export default useListenMessages;