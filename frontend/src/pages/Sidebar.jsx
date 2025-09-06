import React, { useState } from "react";
import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare } from "react-icons/lu";
import { IoMdNotifications } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { LuPencilRuler } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // profile dropdown
  const [more, setMore] = useState(false); // "More" menu

  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/logout");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch(setUser(null));
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  // helper to compute profile route value safely
  const profileRouteValue =
    user?.userName || user?.username || user?.name || user?._id || "me";

  return (
    <div
      className="bg-[#3f0c41] fixed w-[72px] flex flex-col justify-between items-center py-4 shadow-lg top-12 bottom-0"
      role="navigation"
      aria-label="Sidebar"
    >
      {/* Logo / top letter */}
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl cursor-pointer">
        K
      </div>

      {/* --- Menu Center --- */}
      <div className="flex flex-col gap-6 items-center text-gray-400 relative">
        <button
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
          onClick={() => navigate("/home")}
          aria-label="Home"
        >
          <RiHome4Fill className="text-2xl" />
        </button>

        <button
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
          aria-label="Messages"
        >
          <LuMessagesSquare className="text-2xl" />
        </button>

        <button
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
          aria-label="Notifications"
        >
          <IoMdNotifications className="text-2xl" />
        </button>

        <button
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
          aria-label="Saved"
        >
          <CiSaveDown2 className="text-2xl" />
        </button>

        {/* More button */}
        <div className="relative">
          <button
            className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
            onClick={() => setMore((s) => !s)}
            aria-haspopup="true"
            aria-expanded={more}
            aria-label="More"
          >
            <IoIosMore className="text-2xl" />
          </button>

          {more && (
            <div className="absolute left-16 bottom-12 w-[300px] rounded-xl bg-white shadow-lg border border-gray-200 z-50 p-3">
              <p className="text-black font-semibold mb-3">More</p>

              {/* List of items */}
              <div className="flex flex-col gap-3">
                {[
                  { title: "Templates", desc: "Kick-start any job with these pre-built bundles" },
                  { title: "Authentication", desc: "Kick-start any job with these pre-built bundles" },
                  { title: "Canvas", desc: "Kick-start any job with these pre-built bundles" },
                  { title: "Lists", desc: "Kick-start any job with these pre-built bundles" },
                  { title: "Files", desc: "Kick-start any job with these pre-built bundles" },
                  { title: "Channels", desc: "Kick-start any job with these pre-built bundles" },
                  { title: "People", desc: "Manage people & profiles", action: () => navigate(`/profilepage`) },
                  { title: "External connection", desc: "Connect external tools" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-row items-start text-black gap-3 cursor-pointer hover:bg-gray-50 rounded p-2"
                    onClick={() => {
                      if (item.action) item.action();
                      setMore(false);
                    }}
                  >
                    <div className="bg-purple-400 w-[40px] h-[40px] rounded-xl p-[5px] flex items-center justify-center">
                      <LuPencilRuler className="w-[22px] h-[22px]" />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Bottom Section --- */}
      <div className="flex flex-col gap-4 items-center relative">
        <div
          className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-2xl cursor-pointer"
          title="Create"
          aria-label="Create"
        >
          +
        </div>

        {/* Profile Button */}
        <div
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-600 text-white cursor-pointer"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
          title="Profile menu"
        >
          <CgProfile className="text-xl" />
        </div>

        {/* Profile Dropdown */}
        {open && (
          <div className="absolute left-16 bottom-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <p
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => {
                  navigate(`/profile/${profileRouteValue}`);
                  setOpen(false);
                }}
              >
                Profile
              </p>

              <p className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                Preferences
              </p>

              <hr className="my-2" />

              <p
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
              >
                Sign out
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
