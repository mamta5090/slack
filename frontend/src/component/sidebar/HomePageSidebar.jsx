import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

import Koalaliving from '../koalaliving/Koalaliving';
import Avatar from '../Avatar';
import slackbot from '../../assets/slackbot.png';

import { setAllUsers } from '../../redux/userSlice';
import { fetchConversations } from '../../redux/conversationSlice'; 

import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { RiChatThreadLine } from "react-icons/ri";
import { CiHeadphones } from "react-icons/ci";
import { LuSendHorizontal } from "react-icons/lu";
import { FaFileArchive } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoMdArrowDropdown } from "react-icons/io";
import NewChannel from '../subpage/NewChannel';
import { MdKeyboardArrowRight } from "react-icons/md";
import { setChannel } from '../../redux/channelSlice';


const HomePageSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: activeChatId } = useParams();

    const [startOpen, setStartOpen] = useState(false);
    const [openChannel, setOpenChannel] = useState();
    const [directMessageOpen, setDirectMessageOpen] = useState(true);
    const [openApp, setOpenApp] = useState(false);
    const [openBox,setOpenBox]=useState(false)
    const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
    const [openAddChannel,setOpenAddChannel]=useState(false)
    const [openCreate,setCreateOpen]=useState(false)
    const [manageOpen,setManageOpen]=useState(false)
    const [cancel,setCancel]=useState(false)

    const me = useSelector((state) => state.user.user);
    const { allUsers = [] } = useSelector((state) => state.user);
    const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
    const channel=useSelector((state)=>state.channel.channel)
    const allChannels=useSelector((state)=>state.channel.allChannels)

    useEffect(() => {
        dispatch(fetchConversations());
        if (!allUsers || allUsers.length === 0) {
            const fetchAllUsers = async () => {
                try {

                    const token = localStorage.getItem("token");
                    const res = await axios.get("/api/user/get", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    dispatch(setAllUsers(res.data));
                } catch (err) {
                    console.error("Failed to fetch all users:", err);
                }
            };
            fetchAllUsers();
        }
    }, [dispatch, allUsers.length]);

    const openChat = async (otherId) => {
        if (!me?._id) {
            console.error("Cannot open chat: current user not loaded.");
            return;
        }
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                "/api/conversation/",
                { senderId: me._id, receiverId: otherId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(fetchConversations());
        } catch (err) {
            console.error("Failed to create or get conversation:", err);
        }
        navigate(`/user/${otherId}`);
    };

    return (
        <div className="md:w-[350px] w-[200px] min-h-screen bg-[#3f0c41] text-gray-200 flex flex-col border-r border-gray-700 flex-shrink-0">
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


            <div className='flex flex-col flex-grow overflow-y-auto'>
             
                <div className='p-2 space-y-2 border-b border-[#d8c5dd]'>
                    <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer'>
                        <RiChatThreadLine /> <p>Threads</p>
                    </div>
                    <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer'>
                        <CiHeadphones /><p>Huddles</p>
                    </div>
                    <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer'>
                        <LuSendHorizontal /> <p>Drafts & sent</p>
                    </div>
                    <div className='text-[#d8c5dd] hover:bg-[#683c6a] hover:rounded flex flex-row items-center gap-1 p-1 cursor-pointer'>
                        <FaFileArchive /><p>Directories</p>
                    </div>
                </div>

              
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




    
<div className="flex text-[#d8c5dd] items-center justify-between cursor-pointer hover:bg-[#683c6a] p-1 rounded group">
                    <div className='flex items-center gap-[10px] flex-grow' onClick={() => setOpenChannel(prev => !prev)}>
                        <IoMdArrowDropdown className={`transition-transform duration-200 ${openChannel ? "rotate-0" : "-rotate-90"}`} />
                        <p>Channels</p>
                    </div>
                    <div className='relative'>
                        <div className='hover:bg-[#350d36] rounded p-1' onClick={() => setOpenAddChannel(prev => !prev)}>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity"><HiOutlineDotsVertical /></span>
                        </div>
                     
                    </div>
                </div>

                {openChannel && (
                    <div className="p-2 text-white">
                        <ul>
                            {allChannels && allChannels.map((ch) => (
                                <li key={ch._id} className="p-1 px-2 rounded hover:bg-[#350d36] cursor-pointer truncate">
                                    # {ch.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                                <div className='flex p-2 gap-2 hover:bg-[#350d36] hover:rounded cursor-pointer text-white'  onClick={() => setOpenBox(prev=>!prev)}>
                {/* <div className='flex p-2 gap-2 hover:bg-[#350d36] hover:rounded cursor-pointer text-white' onClick={() => setIsNewChannelModalOpen(true)}  onClick={() => setOpenBox(prev => !prev)}> */}
                    <div className='bg-gray-700 px-2 rounded'>+</div>
                    <p>Add channels</p>
                </div>

  {openAddChannel && (

<div className="absolute ml-[190px] flex flex-col -translate-y-1/2  w-[300px] h-[170px]  top-90 rounded-lg bg-white shadow-lg   z-50 text-black">
              <div className="flex flex-col shadow-lg shadow-gray-400  ">
                                <div   className='gap-[200px] flex border-b px-4  items-center  py-4 hover:bg-blue-600 hover:text-white'
                                    onClick={() => {
                                      setCreateOpen(prev=>!prev);
                                    //   setOpenChannel(false)
                                      //setOpenBox(false);
                                    }}>
                                    <p>Create </p>
                                    <MdKeyboardArrowRight />
                                </div>
                                 <div   className='gap-[185px] flex border-b px-4 items-center  py-4 hover:bg-blue-600 hover:text-white'
                                    onClick={() => {
                                        setManageOpen(true); 
                                        openAddChannel(false);
                                    }}>
                                    <p>Manage </p>
                                    <MdKeyboardArrowRight />
                                </div>
                                <div className='px-3 gap-[130px] py-4 flex flex-row  hover:bg-blue-600 hover:text-white cursor-pointer'>
                                    <p>Show and sort</p>
                                    <div className='flex items-center'>
                                        <p>All</p>
                                          <MdKeyboardArrowRight />
                                    </div>
                                </div>
                            </div>
                           </div>
                        )}

                          {openCreate && (
<div className="absolute ml-[480px] flex flex-col -translate-y-1/2  w-[200px] h-[100px]  top-80 rounded-lg bg-white shadow-lg   z-50 text-black">
              <div className="flex flex-col   ">
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'
                                    onClick={() => {
                                        setIsNewChannelModalOpen(true); 
                                        setOpenBox(false);
                                    }}>
                                    Create channel
                                </div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Browse channels</div>
                            </div>
                            </div>
                        )}

                          {manageOpen && (
<div className="absolute ml-[480px] flex flex-col -translate-y-1/2  w-[200px] h-[130px]  top-95 shadow-lg shadow-gray-400 rounded-lg bg-white shadow-lg   z-50 text-black">
              <div className="flex flex-col   ">
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'
                                    onClick={() => {
                                        setManageOpen(prev=>!prev)
                                        //setIsNewChannelModalOpen(true); 
                                        //setOpenBox(false);
                                    }}>
                                    Browser channel
                                </div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Edit sections</div>
                                                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'
                                                                onClick={()=>setCancel(true)}>Leave inactive channels</div>
                            </div>
                            </div>
                        )}

                        {cancel && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
                 <div className="bg-white w-[90%] max-w-[800px] h-[500px] rounded-lg shadow-lg z-50 flex relative">
                    </div>
                    </div>
                        )}

                  {openBox && (
<div className="absolute ml-[90px] flex flex-col -translate-y-1/2  w-[200px] h-[100px]  top-120 rounded-lg bg-white shadow-lg   z-50 text-black">
              <div className="flex flex-col   ">
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'
                                    onClick={() => {
                                        setIsNewChannelModalOpen(true); 
                                        setOpenBox(false);
                                    }}>
                                    Create a new channel
                                </div>
                                <div className='px-3 py-2 hover:bg-blue-600 hover:text-white cursor-pointer'>Browse channels</div>
                            </div>
                            </div>
                        )}

                {/* --- RENDER THE MODAL HERE (SIMPLIFIED) --- */}
                <NewChannel 
                    isVisible={isNewChannelModalOpen} 
                    onClose={() => setIsNewChannelModalOpen(false)} 
                />
                {/* Direct messages */}
                <div
                    className="flex text-[#d8c5dd] items-center gap-3 cursor-pointer hover:bg-[#683c6a] p-1 rounded group"
                    onClick={() => setDirectMessageOpen((prev) => !prev)}
                >
                    <IoMdArrowDropdown
                        className={`transition-transform duration-200 ${directMessageOpen ? "rotate-0" : "-rotate-90"}`}
                    />
                    <p>Direct message</p>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </div>

                {directMessageOpen && (
                    <div className="pl-4 pr-2 space-y-1">
                        {allUsers.length > 0 ? (
                            allUsers
                                .filter(u => u._id !== me?._id)
                                .map((user) => {
                                    const isOnline = onlineUsers.includes(user._id);
                                    const isActive = user._id === activeChatId;

                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => openChat(user._id)}
                                            className={`flex items-center gap-2 p-1 rounded-md cursor-pointer ${isActive ? "bg-[#958197] text-black" : "hover:bg-[#683c6a]"}`}
                                        >
                                            <div className="relative">
                                                <Avatar user={user} size="md" />
                                                <div
                                                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
                                                    title={isOnline ? "Online" : "Offline"}
                                                />
                                            </div>
                                            <p className="text-sm">{user.name}</p>
                                        </div>
                                    );
                                })
                        ) : (
                            <p className="p-2 text-sm text-gray-400">No users found</p>
                        )}
                    </div>
                )}

                {/* Apps Section */}
                <div className='p-2 flex items-center cursor-pointer' onClick={() => setOpenApp((prev) => !prev)}>
                    <IoMdArrowDropdown className={`transition-transform duration-200 ${openApp ? "rotate-0" : "-rotate-90"}`} />
                    Apps
                </div>
                {openApp && (
                    <>
                        <div className='px-3 flex cursor-pointer items-center gap-3 py-1 hover:bg-[#683c6a] rounded-md'>
                            <img src={slackbot} className='w-[25px] rounded' alt="Slackbot icon" />
                            Slackbot
                        </div>
                        <div className='flex cursor-pointer items-center gap-2 px-3 py-1 hover:bg-[#683c6a] rounded-md'>
                            <div className='text-xl bg-[#683c6a] w-[25px] h-[25px] flex items-center justify-center rounded'>+</div>
                            <p>Add apps</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default HomePageSidebar;