import React from "react";
import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare } from "react-icons/lu";
import { IoMdNotifications } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#3f0e40] fixed w-[72px] h-[100vh] flex flex-col justify-between items-center py-4 shadow-lg">

      {/* --- Avatar / Logo Top --- */}
      <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl cursor-pointer">
        K
      </div>

      {/* --- Menu Center --- */}
      <div className="flex flex-col gap-6 items-center text-gray-400">
        <button className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <RiHome4Fill className="text-2xl" />
        </button>

        <button className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <LuMessagesSquare className="text-2xl" />
        </button>

        <button className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <IoMdNotifications className="text-2xl" />
        </button>

        <button className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition">
          <CiSaveDown2 className="text-2xl" />
        </button>

        <button
          onClick={() => navigate("/msg")}
          className="flex flex-col items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition"
        >
          <IoIosMore className="text-2xl" />
        </button>
      </div>

      {/* --- Bottom Section --- */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-2xl cursor-pointer">
          +
        </div>
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-600 text-white cursor-pointer">
          <CgProfile className="text-xl" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
