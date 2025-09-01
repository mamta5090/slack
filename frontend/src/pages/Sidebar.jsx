import React, { useState } from "react";
import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare } from "react-icons/lu";
import { IoMdNotifications } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice"; // ✅ correct import

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/logout");
      dispatch(setUser(null)); 
      navigate("/login"); 
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#3f0e40] fixed w-[72px] h-[95vh] flex flex-col justify-between items-center py-4 shadow-lg top-10">
      {/* --- Avatar / Logo Top --- */}
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl cursor-pointer">
        K
      </div>

      {/* --- Menu Center --- */}
      <div className="flex flex-col gap-6 items-center text-gray-400">
        <button className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <RiHome4Fill className="text-2xl" />
        </button>

        <button className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <LuMessagesSquare className="text-2xl" />
        </button>

        <button className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <IoMdNotifications className="text-2xl" />
        </button>

        <button className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <CiSaveDown2 className="text-2xl" />
        </button>

        <button
          onClick={() => navigate("/msg")}
          className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
        >
          <IoIosMore className="text-2xl" />
        </button>
      </div>

      {/* --- Bottom Section --- */}
      <div className="flex flex-col gap-4 items-center relative">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-2xl cursor-pointer">
          +
        </div>

        {/* Profile Button */}
        <div
          className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-600 text-white cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <CgProfile className="text-xl" />
        </div>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute left-16 bottom-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="p-2">
              <p className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                Profile
              </p>
              <p className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer">
                Preferences
              </p>
              <hr className="my-2" />
              <p
                onClick={handleLogout}
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
