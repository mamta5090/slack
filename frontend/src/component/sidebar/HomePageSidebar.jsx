import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// UI Components & Assets
import Koalaliving from '../koalaliving/Koalaliving';
import Avatar from '../Avatar';
import slackbot from '../../assets/slackbot.png';

// Redux Actions
import { setAllUsers } from '../../redux/userSlice';
// IMPORTANT: You might need to adjust the path to this import
import { fetchConversations } from '../../redux/conversationSlice'; 

// Icons
import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { RiChatThreadLine } from "react-icons/ri";
import { CiHeadphones } from "react-icons/ci";
import { LuSendHorizontal } from "react-icons/lu";
import { FaFileArchive } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { IoMdArrowDropdown } from "react-icons/io";

const HomePageSidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id: activeChatId } = useParams();

    const [startOpen, setStartOpen] = useState(false);
    const [channelsOpen, setChannelsOpen] = useState(false);
    const [directMessageOpen, setDirectMessageOpen] = useState(true);
    const [openApp, setOpenApp] = useState(false);

    const me = useSelector((state) => state.user.user);
    const { allUsers = [] } = useSelector((state) => state.user);
    const { onlineUsers = [] } = useSelector((state) => state.socket) || {};

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

    // This is the JSX for the left sidebar ONLY
    // It does NOT include Topbar or the thin icon Sidebar
    return (
        <div className="md:w-[350px] w-[200px] h-full bg-[#3f0c41] text-gray-200 flex flex-col border-r border-gray-700 flex-shrink-0">
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

            {/* scrollable container for sidebar content */}
            <div className='flex flex-col flex-grow overflow-y-auto'>
                {/* quick nav */}
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
                        className={`transition-transform duration-200 ${channelsOpen ? "rotate-0" : "-rotate-90"}`}
                    />
                    <p>Channels</p>
                </div>

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