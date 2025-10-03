import React, { useState } from 'react'
import Topbar from '../../pages/Topbar'
import Sidebar from '../../pages/Sidebar'
import Koalaliving from '../koalaliving/Koalaliving';
import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { RiChatThreadLine } from "react-icons/ri";
import { CiHeadphones } from "react-icons/ci";
import { LuSendHorizontal } from "react-icons/lu";
import { FaFileArchive } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { IoMdArrowDropdown } from "react-icons/io";
import Avatar from '../Avatar';
import { useSelector } from 'react-redux';
import slackbot from '../../assets/slackbot.png'

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startOpen, setStartOpen] = useState(false)
  const [channelsOpen, setChannelsOpen] = useState(false)
  const [directMessageOpen, setDirectMessageOpen] = useState(false)
  const [openApp,setOpenApp]=useState()

  const user = useSelector((state) => state.user.user)
  const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
  const isOnline = user && onlineUsers.includes(user._id);
  const { allUsers = [] } = useSelector((state) => state.user)

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <Topbar />
      <Sidebar />
      <div className="pt-12 pl-[72px] h-full w-full flex flex-row">

        {/* left sidebar */}
        <div className="md:w-[350px] w-[200px] h-full bg-[#3f0c41] text-gray-200 flex flex-col border-r border-gray-700">

          {/* header */}
          <div className='flex flex-row justify-between items-center p-1 border-b border-gray-700'>
            <div className="flex flex-row items-center gap-[2px]">
              <Koalaliving />
            </div>
            <div className="flex gap-3 text-xl mt-5">
              <CiSettings className="cursor-pointer" />
              <FaRegEdit className="cursor-pointer" />
            </div>
          </div>

          {/* quick nav */}
          <div className=' flex flex-col'>
          <div className='p-2 space-y-2 border-b border-[#d8c5dd]'>
            <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1'>
              <RiChatThreadLine /> <p>Threads</p>
            </div>
            <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1'>
              <CiHeadphones /><p>Huddles</p>
            </div>
            <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1'>
              <LuSendHorizontal /> <p>Drafts & sent</p>
            </div>
            <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1'>
              <FaFileArchive /><p>Directories</p>
            </div>
          </div>

          {/* Starred */}
          <div
            className='flex items-center text-[#d8c5dd] gap-3 p-1 cursor-pointer hover:bg-[#683c6a] mt-2 rounded'
            onClick={() => setStartOpen((prev) => !prev)}
          >
            <CiStar />
            <p>Starred</p>
            <div className='text-blue-800 bg-blue-200 rounded px-1'>New</div>
          </div>
          {startOpen && (
            <div>
              <p className='px-2 text-sm text-[#d8c5dd]'>
                Drag and drop your most important....
              </p>
            </div>
          )}

          {/* Channels */}
          <div
            className='flex text-[#d8c5dd] items-center gap-3 cursor-pointer hover:bg-[#683c6a] p-1 rounded'
            onClick={() => setChannelsOpen((prev) => !prev)}
          >
            <IoMdArrowDropdown
              className={`transition-transform duration-200 ${channelsOpen ? "rotate-180" : "rotate-0"}`}
            />
            <p>Channels</p>
          </div>

          {/* Direct messages */}
          <div
            className="flex text-[#d8c5dd] items-center gap-3 cursor-pointer hover:bg-[#683c6a] p-1 rounded group"
            onClick={() => setDirectMessageOpen((prev) => !prev)}
          >
            <IoMdArrowDropdown
              className={`transition-transform duration-200 ${directMessageOpen ? "rotate-5" : "-rotate-90"}`}
            />
            <p>Direct message</p>
            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">+</span>
          </div>

          {directMessageOpen && (
            <div className="pl-2 overflow-auto space-y-2  h-[250px]">
              {allUsers.length > 0 ? (
                allUsers.map((u) => {
                  const online = onlineUsers.includes(u._id);
                  return (
                    <div key={u._id} className="flex  items-center gap-2">
                      <div className="relative">
                        <Avatar user={u} size="md" />
                        <div
                          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-1 border-white ${online ? "bg-green-500" : "bg-gray-500"}`}
                          title={online ? "Online" : "Offline"}
                        />
                      </div>
                      <p className="text-sm">{u.name}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">No users found</p>
              )}
            </div>
          )}

          
          <div className='p-2 flex items-center cursor-pointer' onClick={()=>setOpenApp((prev)=>!prev)}>  <IoMdArrowDropdown/>Apps</div>


<div className='px-3 flex cursor-pointer gap-3'>
<img src={slackbot} className='w-[25px] rounded'/>
Slackbot
  </div>
  {openApp && (
  <div className='flex cursor-pointer items-center gap-2 px-3 py-1'>
    <div className='text-2xl bg-[#683c6a] w-[30px] px-1 items-center rounded '>+</div>
    <p>Add apps</p>
  </div>
)}
</div>
        </div>

        {/* right main */}
        <div className="flex-1 h-full bg-[#f3f4f6] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Welcome to Koalaliving</h1>
            <p className="text-gray-600 mt-2">Select a conversation or start a new one.</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default HomePage
