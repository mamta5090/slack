import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../../redux/userSlice";
import Avatar from "../Avatar";
import { serverURL } from '../../main';
import Status from "../../pages/Status"; 
import Prefrences from "../../pages/Prefrences";

// --- Helper Functions ---

/**
 * Checks if current time is outside the user's notification schedule
 */
export const isOutsideNotificationSchedule = (preferences) => {
  if (!preferences || !preferences.notifications?.schedule) return false;

  const { schedule } = preferences.notifications;
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDayName = days[now.getDay()];

  // Find today's schedule
  const todaySchedule = schedule.days?.find(d => d.day === currentDayName);
  if (!todaySchedule) return false;

  const parseTime = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
    const d = new Date();
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return d;
  };

  const startTime = parseTime(todaySchedule.start);
  const endTime = parseTime(todaySchedule.end);

  // Return true if current time is BEFORE start or AFTER end
  return now < startTime || now > endTime;
};

/**
 * Checks if a manual pause is currently active
 */
export const isManualPauseActive = (user) => {
  if (!user || !user.notificationPausedUntil) return false;
  return new Date(user.notificationPausedUntil) > new Date();
};

// --- Icons ---
const SmileIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const HelpCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const Sidebarprofile = () => {
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false); 
  const [openCustomNotification, setOpenCustomNotification] = useState(false);
  const [openPreferences, setOpenPrefrences] = useState(false);
  const [userPrefs, setUserPrefs] = useState(null);

  // Custom Modal States
  const [customDate, setCustomDate] = useState("2025-12-26");
  const [customTime, setCustomTime] = useState("13:00");

  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
  const isOnline = user && onlineUsers.includes(user._id);
  const workspaceName = "Koalaliving"; 
  const profileRouteValue = user?.username || user?._id || "me";

  // --- Fetch Preferences for Schedule logic ---
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/preferences/${user._id}`);
        setUserPrefs(res.data);
      } catch (err) {
        console.error("Error fetching preferences", err);
      }
    };
    if (user?._id) fetchPrefs();
  }, [user?._id, openPreferences]); // Refresh if preferences are closed (updated)

  // --- DND Logic Calculation ---
  const manualPause = useMemo(() => isManualPauseActive(user), [user]);
  const schedulePause = useMemo(() => isOutsideNotificationSchedule(userPrefs), [userPrefs]);
  const isDNDActive = manualPause || schedulePause;

  // --- API HANDLER ---
  const handleSetDND = async (type, value, pauseMode = 'everyone') => {
    try {
      let payload = { pauseMode }; 

      if (type === 'duration') {
        payload.duration = value;
      } else if (type === 'date') {
        payload.customIsoDate = value;
      } else if (type === 'resume') {
        payload.mode = 'resume';
      }

      const res = await axios.put(`${serverURL}/api/user/pause-notifications`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      if (res.data.success) {
        dispatch(setUser(res.data.user)); 
        setShowNotifications(false);
        setOpen(false);
        setOpenCustomNotification(false);
      }
    } catch (error) {
      console.error("Error setting DND:", error);
    }
  };

  const handleCustomSave = () => {
    const combinedDateTime = new Date(`${customDate}T${customTime}:00`).toISOString();
    handleSetDND('date', combinedDateTime);
  };

  const getTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0); 
    return d.toISOString();
  };

  const getNextWeekMorning = () => {
    const d = new Date();
    const day = d.getDay(); 
    const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
    d.setDate(d.getDate() + daysUntilNextMonday);
    d.setHours(9, 0, 0, 0); 
    return d.toISOString();
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${serverURL}/api/user/logout`);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch(setUser(null));
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setShowNotifications(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="relative focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar user={user} size="md" />
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-500"}`} />
        {isDNDActive && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
             <div className="w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center">
                <div className="w-1.5 h-0.5 bg-white rounded-full"></div>
             </div>
          </div>
        )}
      </button>

      {showStatusModal && <Status onClose={() => setShowStatusModal(false)} />}

      {open && (
        <div ref={menuRef} className="absolute left-14 bottom-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 text-gray-800 font-sans">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3 mb-3">
              <Avatar user={user} size="md" /> 
              <div className="flex flex-col text-left">
                <span className="font-bold text-gray-900 text-lg leading-tight">{user.name || user.username}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-xs text-gray-500">{isOnline ? 'Active' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <button 
                className="w-full flex items-center gap-2 text-gray-500 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded px-2 py-1.5 transition-colors text-sm"
                onClick={() => { setOpen(false); setShowStatusModal(true); }}
            >
               <SmileIcon />
               <span className="text-gray-400">Update your status</span>
            </button>
          </div>

          <div className="py-2 border-t border-gray-100 relative">
            <button className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
              Set yourself as <strong>away</strong>
            </button>
            
            <button 
              className={`w-full flex items-center justify-between text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors ${showNotifications ? 'bg-blue-600 text-white' : ''}`}
              onMouseEnter={() => setShowNotifications(true)} 
              onClick={() => setShowNotifications(!showNotifications)} 
            >
              <div className="flex flex-col">
                <span>{isDNDActive ? "Notifications Paused" : "Pause notifications"}</span>
                {manualPause ? (
                  <span className="text-xs opacity-80">
                    Until {new Date(user.notificationPausedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : schedulePause ? (
                  <span className="text-xs opacity-80">On a schedule</span>
                ) : (
                  <span className="text-xs opacity-80">On</span>
                )}
              </div>
              <ChevronRight />
            </button>

           {showNotifications && (
              <div className="absolute left-full bottom-[-140px] w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden text-gray-800">
                
                {/* DO NOT DISTURB BANNER (From Image Reference) */}
                {schedulePause && !manualPause && (
                  <div className="bg-[#1d1c1d] p-5 text-white relative overflow-hidden">
                      <div className="flex justify-between items-start z-10 relative">
                          <div className="flex flex-col gap-1">
                              <span className="font-bold text-sm">Do not disturb</span>
                              <span className="text-xs text-gray-300">Notifications paused until {userPrefs?.notifications?.schedule?.days?.find(d => d.day === ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()])?.start}</span>
                          </div>
                          <span className="text-2xl">🎧</span>
                      </div>
                      <div className="mt-4 flex flex-col gap-2.5 z-10 relative">
                          <button onClick={() => handleSetDND('resume')} className="text-left text-sm font-bold text-[#e01e5a] hover:underline">
                              Resume notifications
                          </button>
                          <button onClick={() => { setOpenPrefrences(true); setShowNotifications(false); }} className="text-left text-xs text-gray-300 hover:underline">
                              Adjust time
                          </button>
                          <button onClick={() => { setOpenPrefrences(true); setShowNotifications(false); }} className="text-left text-xs text-gray-300 hover:underline">
                              Set a notification schedule
                          </button>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-10 text-7xl rotate-12">🎧</div>
                  </div>
                )}

                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center text-gray-900 bg-white">
                    <span className="font-bold text-sm">Pause notifications...</span>
                    <HelpCircle />
                </div>
                <div className="py-2 bg-white">
                    {manualPause && (
                        <button onClick={() => handleSetDND('resume')} className="w-full text-left px-5 py-1.5 text-sm font-bold text-green-600 hover:bg-blue-600 hover:text-white transition-colors">
                            Resume notifications
                        </button>
                    )}
                    <button onClick={() => handleSetDND('duration', 30)} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">For 30 minutes</button>
                    <button onClick={() => handleSetDND('duration', 60)} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">For 1 hour</button>
                    <button onClick={() => handleSetDND('duration', 120)} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">For 2 hours</button>
                    <button onClick={() => handleSetDND('date', getTomorrowMorning())} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">Until tomorrow</button>
                    <button onClick={() => handleSetDND('date', getNextWeekMorning())} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">Until next week</button>
                    <button onClick={() => setOpenCustomNotification(true)} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">Custom...</button>
                </div>

                <div className="py-2 border-t border-gray-100 bg-white">
                     <button 
                        onClick={() => handleSetDND('duration', 60, 'except_vips')} 
                        className="w-full text-left px-5 py-2 hover:bg-blue-600 group transition-colors"
                     >
                        <div className="text-sm font-medium text-gray-800 group-hover:text-white">Pause for all except VIPs</div>
                        <div className="text-xs text-gray-500 mt-0.5 group-hover:text-blue-100 leading-snug">
                            Always allow notifications from certain people by adding them as a VIP.
                        </div>
                     </button>
                </div>
              </div>
            )}
          </div>

          <div className="py-2 border-t border-gray-100">
            <button onClick={() => { navigate(`/profile/${profileRouteValue}`); setOpen(false); }} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">Profile</button>
            <button 
              onClick={() => { setOpenPrefrences(true); setOpen(false); }} 
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Preferences
            </button>
          </div>

          {openPreferences && (
            <Prefrences 
              userId={user?._id} 
              onClose={() => setOpenPrefrences(false)} 
            />
          )}

          <div className="py-2 border-t border-gray-100">
           <button 
              onClick={() => { handleLogout(); setOpen(false); }}
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Sign out of {workspaceName}
            </button>
          </div>
        </div>
      )}

      {/* CUSTOM DND MODAL */}
      {openCustomNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[1px]">
          <div className="w-full max-w-[440px] rounded-lg bg-white p-8 shadow-2xl relative">
            
            <button 
              onClick={() => setOpenCustomNotification(false)}
              className="absolute right-6 top-6 text-gray-500 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <h2 className="mb-6 text-2xl font-black text-[#1d1c1d]">Pause notifications</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-[15px] font-bold text-[#1d1c1d]">
                  Pause notifications until...
                </label>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-[15px] focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-[15px] font-bold text-[#1d1c1d]">
                  Time
                </label>
                <div className="relative">
                  <select 
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="w-full appearance-none rounded border border-gray-300 bg-white px-3 py-2 text-[15px] focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="21:00">9:00 PM</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={handleCustomSave}
                className="rounded-[4px] bg-[#007a5a] px-6 py-2 text-[15px] font-bold text-white transition-colors hover:bg-[#006248]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebarprofile;