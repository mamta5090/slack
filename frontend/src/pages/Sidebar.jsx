import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icon Imports
import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare, LuPencilRuler } from "react-icons/lu";
import { IoMdNotifications, IoIosMore } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";

// Component Imports
import Sidebarprofile from "../component/profile/Sidebarprofile";

const Sidebar = () => {
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const moreMenuRef = useRef(null);
  const moreButtonRef = useRef(null);

  const moreItems = [
    { title: "Authentication", desc: "Authentication helpers & examples" },
    { title: "Canvas", desc: "Design and sketch features" },
    { title: "Lists", desc: "Predefined list templates" },
    { title: "Files", desc: "Manage your files" },
    { title: "Channels", desc: "Workspace channels" },
    { title: "People", desc: "Manage people & profiles", action: () => navigate(`/profilepage`) },
    { title: "External connection", desc: "Connect external tools" },
  ];

  // Effect to close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target)
      ) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      // --- THE FIX IS HERE: ADDED z-30 TO THE ENTIRE SIDEBAR ---
      className="bg-[#3f0c41] fixed w-[72px] flex flex-col justify-between items-center py-4 shadow-lg top-12 bottom-0 z-50"
      aria-label="Sidebar"
    >
      <button
        onClick={() => navigate("/")}
        type="button"
        className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl cursor-pointer"
        aria-label="Go to Home"
      >
        K
      </button>

      {/* --- Middle Navigation --- */}
      <div className="flex flex-col gap-2 items-center text-gray-400">
        <button type="button" className="sidebar-btn" onClick={() => navigate("/home")}><RiHome4Fill className="text-2xl" /><span className="text-xs mt-1">Home</span></button>
        <button type="button" className="sidebar-btn" onClick={() => navigate("/messages")}><LuMessagesSquare className="text-2xl" /><span className="text-xs mt-1">DMs</span></button>
        <button type="button" className="sidebar-btn" onClick={() => navigate("/notifications")}><IoMdNotifications className="text-2xl" /><span className="text-xs mt-1">Activity</span></button>
        <button type="button" className="sidebar-btn" onClick={() => navigate("/saved")}><CiSaveDown2 className="text-2xl" /><span className="text-xs mt-1">Later</span></button>

        {/* More button */}
        <div className="relative">
          <button
            ref={moreButtonRef}
            type="button"
            className="sidebar-btn"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            aria-haspopup="true"
            aria-expanded={moreMenuOpen}
          >
            <IoIosMore className="text-2xl" />
            <span className="text-xs mt-1">More</span>
          </button>
          {moreMenuOpen && (
            // This z-index is now relative to the parent sidebar's z-30
            <div
              ref={moreMenuRef}
              className="absolute left-[72px] bottom-0 w-[300px] rounded-xl bg-white shadow-lg border border-gray-200 p-3 z-50"
              role="menu"
            >
              <p className="text-black font-semibold mb-3">More</p>
              <div className="flex flex-col gap-1">
                {moreItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (item.action) item.action();
                      setMoreMenuOpen(false);
                    }}
                    className="flex flex-row items-start text-black gap-3 cursor-pointer hover:bg-gray-50 rounded p-2 text-left"
                    role="menuitem"
                  >
                    <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-xl p-2 flex items-center justify-center"><LuPencilRuler /></div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Bottom Section --- */}
      <div className="flex flex-col gap-4 items-center">
        <button
          type="button"
          className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-2xl cursor-pointer"
          title="Create"
          onClick={() => navigate("/create")}
        >
          +
        </button>
        <Sidebarprofile />
      </div>
    </nav>
  );
};



export default Sidebar;