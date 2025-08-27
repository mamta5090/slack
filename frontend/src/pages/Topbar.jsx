import React from "react";
import { CiClock2, CiSearch } from "react-icons/ci";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Topbar = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user); // get logged-in user from Redux

  return (
    <div className="w-full h-12 bg-gray-800 text-white flex items-center justify-between shadow-md px-4">
      {/* Left section: navigation + clock */}
      <div className="flex items-center gap-5 w-[36%]">
        <FaArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
        <FaArrowRight onClick={() => navigate(1)} className="cursor-pointer" />
        <CiClock2 />
      </div>

      {/* Center: Search */}
      <div className="flex items-center bg-gray-700 rounded-md px-3 py-1">
        <input
          type="text"
          placeholder="Search Koalaliving..."
          className="bg-gray-700 text-white px-2 focus:outline-none w-64"
        />
        <CiSearch className="text-xl ml-2" />
      </div>

      {/* Right: notifications + logged-in user */}
      <div className="flex items-center space-x-4">
        <span className="cursor-pointer">🔔</span>
        {user ? (
          <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-gray-600" />
        )}
      </div>
    </div>
  );
};

export default Topbar;
