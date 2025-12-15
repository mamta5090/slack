import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../../redux/userSlice";
import Avatar from "../Avatar";
import { serverURL } from '../../main';
import Status from "../../pages/Status"; 

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
  
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
  
  const isOnline = user && onlineUsers.includes(user._id);
  const workspaceName = "Koalaliving"; 
  const profileRouteValue = user?.username || user?._id || "me";

  // Check if Do Not Disturb is currently active
  const isDNDActive = user?.notificationPausedUntil && new Date(user.notificationPausedUntil) > new Date();

  // --- Helper Functions to Calculate ISO Dates ---
  const getTomorrowMorning = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0); // 9:00 AM
    return d.toISOString();
  };

  const getNextWeekMorning = () => {
    const d = new Date();
    const day = d.getDay(); // 0 (Sun) to 6 (Sat)
    // Calculate days until next Monday. If today is Monday (1), add 7.
    const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
    d.setDate(d.getDate() + daysUntilNextMonday);
    d.setHours(9, 0, 0, 0); // 9:00 AM
    return d.toISOString();
  };

  // --- API Handler ---
  const handleSetDND = async (type, value) => {
    try {
      let payload = {};

      if (type === 'duration') {
        // value is in minutes (30, 60, 120)
        payload = { duration: value };
      } else if (type === 'date') {
        // value is ISO string
        payload = { customIsoDate: value };
      } else if (type === 'resume') {
        // Clear the status
        payload = { mode: 'resume' };
      }

      const res = await axios.put(
        `${serverURL}/api/user/pause-notifications`, 
        payload, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      if (res.data.success) {
        // Update Redux with new user data immediately so UI reflects change
        dispatch(setUser(res.data.user));
        // Close menus
        setShowNotifications(false);
        setOpen(false);
      }
    } catch (error) {
      console.error("Error setting DND:", error);
    }
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
      
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        type="button"
        className="relative focus:outline-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar user={user} size="md" />
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-500"
          }`}
        />
      </button>

      {/* Status Modal */}
      {showStatusModal && (
        <Status onClose={() => setShowStatusModal(false)} />
      )}

      {/* Main Dropdown Menu */}
      {open && (
        <div
          ref={menuRef}
          className="absolute left-14 bottom-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 text-gray-800 font-sans"
          style={{ animation: "fadeIn 0.1s ease-out" }}
        >

          {/* Header Section */}
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <Avatar user={user} size="md" /> 
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-gray-900 text-lg leading-tight">
                  {user.name || user.username}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  <span className="text-xs text-gray-500">{isOnline ? 'Active' : 'Offline'}</span>
                </div>
              </div>
            </div>

            <button 
                className="w-full flex items-center gap-2 text-gray-500 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded px-2 py-1.5 transition-colors text-sm"
                onClick={() => {
                    setOpen(false);
                    setShowStatusModal(true); 
                }}
            >
               <SmileIcon />
               <span className="text-gray-400">Update your status</span>
            </button>
          </div>

          {/* Status & Notifications Section */}
          <div className="py-2 border-t border-gray-100 relative">
            <button 
               onMouseEnter={() => setShowNotifications(false)}
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Set yourself as <strong>away</strong>
            </button>
            
            {/* PAUSE NOTIFICATIONS TRIGGER */}
            <button 
              className={`w-full flex items-center justify-between text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors ${showNotifications ? 'bg-blue-600 text-white' : ''}`}
              onMouseEnter={() => setShowNotifications(true)} 
              onClick={() => setShowNotifications(!showNotifications)} 
            >
              <div className="flex flex-col">
                <span>{isDNDActive ? "Notifications Paused" : "Pause notifications"}</span>
                {isDNDActive && (
                  <span className="text-xs opacity-80">
                    Until {new Date(user.notificationPausedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <ChevronRight />
            </button>

           {/* PAUSE NOTIFICATIONS SUB-MENU */}
           {showNotifications && (
              <div className="absolute left-full bottom-[-180px] w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden text-gray-800">
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center text-gray-900">
                    <span className="font-bold text-sm">Pause notifications...</span>
                    <span className="text-gray-400"><HelpCircle /></span>
                </div>
                <div className="py-2">
                    
                    {/* Resume Option (Only if Paused) */}
                    {isDNDActive && (
                        <button 
                            onClick={() => handleSetDND('resume')}
                            className="w-full text-left px-5 py-1.5 text-sm font-bold text-green-600 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                            Resume notifications
                        </button>
                    )}

                    {/* Time Options */}
                    <button 
                        onClick={() => handleSetDND('duration', 30)} 
                        className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        For 30 minutes
                    </button>
                    <button 
                        onClick={() => handleSetDND('duration', 60)} 
                        className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        For 1 hour
                    </button>
                    <button 
                        onClick={() => handleSetDND('duration', 120)} 
                        className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        For 2 hours
                    </button>
                    <button 
                        onClick={() => handleSetDND('date', getTomorrowMorning())} 
                        className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        Until tomorrow
                    </button>
                    <button 
                        onClick={() => handleSetDND('date', getNextWeekMorning())} 
                        className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                    >
                        Until next week
                    </button>
                    
                    <button className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
                        Custom...
                    </button>
                </div>

                <div className="py-2 border-t border-gray-100">
                     <button className="w-full text-left px-5 py-2 hover:bg-blue-600 group transition-colors">
                        <div className="text-sm font-medium text-gray-800 group-hover:text-white">Pause for all except VIPs</div>
                        <div className="text-xs text-gray-500 mt-0.5 group-hover:text-blue-100 leading-snug">
                            Always allow notifications from certain people by adding them as a VIP.
                        </div>
                     </button>
                </div>
                 <div className="py-2 border-t border-gray-100">
                    <button className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
                        Set a notification schedule
                    </button>
                 </div>
              </div>
            )}
          </div>

          {/* Profile & Preferences */}
          <div className="py-2 border-t border-gray-100">
            <button
              onClick={() => { navigate(`/profile/${profileRouteValue}`); setOpen(false); }}
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Profile
            </button>
            <button
              onClick={() => { navigate("/settings"); setOpen(false); }}
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Preferences
            </button>
          </div>

          {/* Downloads & Logout */}
          <div className="py-2 border-t border-gray-100">
             <button className="w-full flex items-center justify-between text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
              <span>Downloads</span>
              <span className="text-xs text-gray-400 opacity-70">Ctrl+Shift+J</span>
            </button>
            
            <button
              onClick={() => { handleLogout(); setOpen(false); }}
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Sign out of {workspaceName}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Sidebarprofile;