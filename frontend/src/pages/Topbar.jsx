import React from "react";
import { CiClock2 } from "react-icons/ci";
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
const Topbar = () => {
  return (
    <div className="w-full h-12 bg-gray-800 text-white flex items-center justify-between  shadow-md">
<div className="flex items-center justify-end w-[36%]   gap-[20px]">
 <FaArrowLeft />
      <FaArrowRight />
      <CiClock2 />
</div>
     
      <div className="flex bg-gray-700 text-white px-3 py-1 rounded-md w-89 focus:outline-none justify-start">
         <input
        type="text"
        placeholder="Search Koalaliving..."
        className="bg-gray-700 text-white px-3 py-1 rounded-md w-64 focus:outline-none"
      />
        <CiSearch className=" text-xl m-[3px]"/>
      </div>
     
      <div className="flex items-center space-x-4">
        <span className="cursor-pointer">🔔</span>
        <span className="cursor-pointer">👤</span>
      </div>
    </div>
  );
};

export default Topbar;
