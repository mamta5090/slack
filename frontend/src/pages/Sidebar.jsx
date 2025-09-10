import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";

import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare, LuPencilRuler } from "react-icons/lu";
import { IoMdNotifications, IoIosMore } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // profile dropdown
  const [more, setMore] = useState(false); // "More" menu

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const moreRef = useRef(null);
  const profileRef = useRef(null);
  const moreButtonRef = useRef(null);
  const profileButtonRef = useRef(null);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/logout");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch(setUser(null));
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const profileRouteValue =
    user?.userName || user?.username || user?.name || user?._id || "me";

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

  // click-outside + Escape handler to close menus
  useEffect(() => {
    function handleDocClick(e) {
      // close 'more' when clicking outside its box and the button
      if (more && moreRef.current && !moreRef.current.contains(e.target) && !moreButtonRef.current.contains(e.target)) {
        setMore(false);
      }
      // close 'profile' when clicking outside its box and the button
      if (open && profileRef.current && !profileRef.current.contains(e.target) && !profileButtonRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setMore(false);
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleDocClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [more, open]);

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

        {/* Profile Button */}
        <div className="relative">
          <button
            ref={profileButtonRef}
            type="button"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-600 text-white cursor-pointer"
            onClick={() => {
              console.log("Profile clicked");
              setOpen(s => !s);
            }}
            aria-haspopup="true"
            aria-expanded={open}
            title="Profile menu"
            aria-label="Profile menu"
          >
            <CgProfile className="text-xl" />
          </button>

          {open && (
            <div
              ref={profileRef}
              className="absolute left-[80px] bottom-0 mb-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
              role="menu"
              aria-label="Profile menu options"
            >
              <div className="p-2">
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${profileRouteValue}`);
                    setOpen(false);
                  }}
                >
                  Profile
                </button>

                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate("/profilepage");
                    setOpen(false);
                  }}
                >
                  Preferences
                </button>

                <hr className="my-2" />

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </nav>
  );
};

export default Sidebar;
