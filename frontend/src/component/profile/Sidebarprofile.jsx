import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../../redux/userSlice";
import Avatar from "../Avatar";
import { serverURL } from '../../main';
import Status from "../../pages/Status"; // Importing the corrected Status component

// Icons
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
  const [showStatusModal, setShowStatusModal] = useState(false); // Controls the Status Modal
  
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
  
  const isOnline = user && onlineUsers.includes(user._id);
  const workspaceName = "Koalaliving"; 
  const profileRouteValue = user?.username || user?._id || "me";

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

  // Close sidebar menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      // Don't close if we clicked the button
      if (buttonRef.current && buttonRef.current.contains(e.target)) return;
      
      // Close if we clicked outside the menu
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
      
      {/* Sidebar Trigger Button */}
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

      {/* RENDER STATUS MODAL: Independent of the menu */}
      {showStatusModal && (
        <Status onClose={() => setShowStatusModal(false)} />
      )}

      {/* MAIN POPUP MENU */}
      {open && (
        <div
          ref={menuRef}
          className="absolute left-14 bottom-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 text-gray-800 font-sans"
          style={{ animation: "fadeIn 0.1s ease-out" }}
        >
          {/* Section 1: Header & Status */}
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
                    setOpen(false); // Close the menu
                    setShowStatusModal(true); // Open the Status Modal
                }}
            >
               <SmileIcon />
               <span className="text-gray-400">Update your status</span>
            </button>
          </div>

          {/* Section 2: Availability & Notifications */}
          <div className="py-2 border-t border-gray-100 relative">
            <button 
               onMouseEnter={() => setShowNotifications(false)}
              className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors"
            >
              Set yourself as <strong>away</strong>
            </button>
            
            <button 
              className={`w-full flex items-center justify-between text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors ${showNotifications ? 'bg-blue-600 text-white' : ''}`}
              onMouseEnter={() => setShowNotifications(true)} 
              onClick={() => setShowNotifications(!showNotifications)} 
            >
              <span>Pause notifications</span>
              <ChevronRight />
            </button>

            {/* --- NOTIFICATION SUBMENU --- */}
           {showNotifications && (
              <div className="absolute left-full bottom-[-180px] w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-[60] overflow-hidden text-gray-800">
                <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center text-gray-900">
                    <span className="font-bold text-sm">Pause notifications...</span>
                    <span className="text-gray-400"><HelpCircle /></span>
                </div>
                <div className="py-2">
                    {['For 30 minutes', 'For 1 hour', 'For 2 hours', 'Until tomorrow', 'Until next week'].map((time) => (
                        <button key={time} className="w-full text-left px-5 py-1.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
                            {time}
                        </button>
                    ))}
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

          {/* Section 3: Profile & Preferences */}
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

          {/* Section 4: Downloads & Logout */}
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