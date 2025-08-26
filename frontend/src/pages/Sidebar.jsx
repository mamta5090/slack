import React from 'react'
import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare } from "react-icons/lu";
import { IoMdNotifications } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { IoIosMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
const Sidebar = () => {
  return (
    <div className='bg-gray-800 w-[8%] h-[calc(100vh-48px)]  flex flex-col gap-[10px] relative py-[10px] items-center'>
      <div className="flex  bg-gray-300  h-[40px] w-[40px] justify-center items-center text-2xl rounded-xl">
  K
</div>

<div className='flex flex-col justify-center items-center gap-[25px]'>
<div className="flex flex-col items-center justify-center h-[60px] w-[60px] rounded-xl  hover:bg-gray-500 text-white cursor-pointer">
  <RiHome4Fill className="text-2xl" />
  <span className="text-xs">Home</span>
</div>


 <div className="flex flex-col hover:bg-gray-500 text-white h-[40px] w-[40px] justify-center items-center text-2xl rounded-xl cursor-pointer">
  <LuMessagesSquare /> 
   <span className="text-xs">DMs</span> 
</div>
 <div className="flex flex-col hover:bg-gray-500 text-white h-[40px] w-[40px] justify-center items-center text-2xl rounded-xl cursor-pointer">
  <IoMdNotifications />
   <span className="text-xs">Activity</span>
</div>
 <div className="flex flex-col hover:bg-gray-500 text-white h-[40px] w-[40px] justify-center items-center text-2xl rounded-xl cursor-pointer">
  <CiSaveDown2 />
   <span className="text-xs">Later</span>
</div>
 <div className="flex flex-col hover:bg-gray-500 text-white h-[40px] w-[40px] justify-center items-center text-2xl rounded-xl cursor-pointer">
  <IoIosMore />
   <span className="text-xs">DMs</span>
</div>
</div>


<div className='bg-gray-800 w-[8%] min-h-screen flex flex-col gap-[15px] relative py-[10px] items-center top-[10px]'>
     <div className="flex text-white bg-gray-700  h-[40px] w-[40px] justify-center items-center text-2xl rounded-full cursor-pointer">
  +
</div>
<div className="flex text-white bg-gray-700  h-[40px] w-[40px] justify-center items-center text-2xl rounded-xl cursor-pointer">
  <CgProfile />
</div>

</div>
    </div>
  )
}

export default Sidebar
