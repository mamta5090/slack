import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";


import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare, LuPencilRuler } from "react-icons/lu";
import { IoMdNotifications, IoIosMore } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
import Sidebarprofile from "../component/profile/Sidebarprofile";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // profile dropdown
  const [more, setMore] = useState(false); // "More" menu



  const moreRef = useRef(null);
  const moreButtonRef = useRef(null);

  const moreItems = [
    { title: "Templates", desc: "Kick-start any job with these pre-built bundles" },
    { title: "Authentication", desc: "Authentication helpers & examples" },
    { title: "Canvas", desc: "Design and sketch features" },
    { title: "Lists", desc: "Predefined list templates" },
    { title: "Files", desc: "Manage your files" },
    { title: "Channels", desc: "Workspace channels" },
    { title: "People", desc: "Manage people & profiles", action: () => navigate(`/profilepage`) },
    { title: "External connection", desc: "Connect external tools" },
  ];



  return (
    <nav
      className="bg-[#3f0c41] fixed w-[72px] flex flex-col justify-between items-center py-4 shadow-lg top-12 bottom-0"
      aria-label="Sidebar"
    >
      <button
        onClick={() => navigate("/home")}
        type="button"
        className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl cursor-pointer"
        aria-label="Go to Home"
      >
        K
      </button>

      <div className="flex flex-col gap-6 items-center text-gray-400 relative">
        <button
          type="button"
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
          onClick={() => navigate("/home")}
          aria-label="Home"
        >
          <RiHome4Fill className="text-2xl" />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
          onClick={() => navigate("/messages")}
          aria-label="Direct messages"
        >
          <LuMessagesSquare className="text-2xl" />
          <span className="text-xs mt-1">DMs</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <IoMdNotifications className="text-2xl" />
          <span className="text-xs mt-1">Activity</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
          onClick={() => navigate("/saved")}
          aria-label="Saved items"
        >
          <CiSaveDown2 className="text-2xl" />
          <span className="text-xs mt-1">Later</span>
        </button>

        {/* More button */}
        <div className="relative">
          <button
            ref={moreButtonRef}
            type="button"
            className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition cursor-pointer"
            onClick={() => setMore(!more)}
            aria-haspopup="true"
            aria-expanded={more}
            aria-label="More menu"
          >
            <IoIosMore className="text-2xl" />
          </button>

          {more && (
            // safer position: open to the right of the sidebar, top aligned with button
            <div
              ref={moreRef}
              className="absolute left-[80px] bottom-0  mt-2 w-[300px] rounded-xl bg-white shadow-lg border border-gray-200 z-50 p-3"
              role="menu"
              aria-label="More menu list"
            >
              <p className="text-black font-semibold mb-3">More</p>

              <div className="flex flex-col gap-3">
               {moreItems.map((item, idx) => (
  <button
    key={idx}
    type="button"
    // Use the item's action if it exists, otherwise do nothing or close the menu.
    onClick={() => {
      if (item.action) {
        item.action();
      }
      // You probably want to close the 'more' menu after clicking an item.
      setMore(false);
    }}
    className="flex flex-row items-start text-black gap-3 cursor-pointer hover:bg-gray-50 rounded p-2 text-left"
    role="menuitem"
  >
    <div className="bg-purple-400 w-[40px] h-[40px] rounded-xl p-[5px] flex items-center justify-center">
      <LuPencilRuler className="w-[22px] h-[22px]" />
    </div>
    <div className="flex flex-col">
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

      {/* Bottom Section */}
      <div className="flex flex-col gap-4 items-center relative">
        <button
          type="button"
          className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-2xl cursor-pointer"
          title="Create"
          aria-label="Create"
          onClick={() => navigate("/create")}
        >
          +
        </button>

      <Sidebarprofile/>
        
      </div>
    </nav>
  );
};

export default Sidebar;
