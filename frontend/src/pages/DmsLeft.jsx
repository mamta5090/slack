import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CiSearch } from "react-icons/ci";
import { FaEdit } from "react-icons/fa";
import { fetchConversations, selectAllConversations } from "../redux/conversationSlice";
import { setAllUsers } from "../redux/userSlice";
import { serverURL } from '../main';
import Avatar from "../component/Avatar";

const DmsLeft = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id: activeChatId } = useParams();
  const me = useSelector((s) => s.user.user);
  const { allUsers = [] } = useSelector((s) => s.user);
  const conversations = useSelector(selectAllConversations) || [];
  const { onlineUsers = [] } = useSelector((s) => s.socket) || {};

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchConversations());
    if (!allUsers || allUsers.length === 0) {
      const fetchAllUsers = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${serverURL}/api/user/get`, {
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

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedFilter = searchTerm.toLowerCase();
    return allUsers
      .filter((u) => String(u._id) !== String(me?._id))
      .filter((u) => (u.name || "").toLowerCase().includes(lowercasedFilter));
  }, [searchTerm, allUsers, me?._id]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [conversations]);

  const openChat = (otherId) => {
    navigate(`/dms/${otherId}`);
  };

  const renderUserItem = (item) => {
    const chatUser = item.other; // Renamed to avoid confusion with logged-in user
    if (!chatUser) return null;

    const isOnline = onlineUsers.some((id) => String(id) === String(chatUser._id));
    const isActive = String(chatUser._id) === String(activeChatId);

    // --- DYNAMIC IMAGE CALCULATION FOR EACH USER ---
    const userImg = chatUser.profilePic || chatUser.avatar;
    const userSrc = userImg?.startsWith("http") ? userImg : `${serverURL}/${userImg}`;

    return (
      <div
        key={chatUser._id}
        onClick={() => openChat(chatUser._id)}
        className={`flex items-center justify-between hover:bg-[#3e1d3f] rounded-md p-2 cursor-pointer transition-colors ${
          isActive ? "bg-white text-black" : "text-gray-300"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex-shrink-0">
            {/* Using your existing Avatar component is better, but here is the manual fix */}
            {userImg ? (
              <img 
                src={userSrc} 
                alt={chatUser.name} 
                className="w-10 h-10 rounded-full object-cover border border-gray-600" 
              />
            ) : (
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                {chatUser.name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#5a2a5c] bg-green-500" />
            )}
          </div>

          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-1.5">
              <p className={`font-semibold text-sm truncate ${isActive ? 'text-black' : 'text-white'}`}>
                {chatUser.name}
              </p>
              {chatUser.status?.emoji && (
                <span className="text-sm" title={chatUser.status.text || ""}>
                  {chatUser.status.emoji}
                </span>
              )}
            </div>
            <p className={`text-xs truncate ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
              {item.lastMessage?.text || 'No messages yet'}
            </p>
          </div>
        </div>

        {item.unreadCount > 0 && (
          <span className="min-w-[20px] h-[20px] px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {item.unreadCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="lg:w-[640px] lg:pl-[75px] pt-[50px] pl-[54px] flex-shrink-0 h-full bg-[#5a2a5c] flex flex-col border-r border-gray-700">
      <div className="p-3 border-b border-purple-900 flex justify-between items-center flex-shrink-0">
        <h3 className="font-bold text-lg text-white">Direct messages</h3>
        <FaEdit className="text-xl text-white cursor-pointer" />
      </div>

      <div className="p-3 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Find a DM"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#3e1d3f] border border-gray-500 text-white rounded-md py-1.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-2 space-y-1">
        {searchTerm ? (
          searchResults.length > 0 ? (
            searchResults.map((u) => renderUserItem({ other: u }))
          ) : (
            <p className="text-gray-400 text-sm px-2">No users found</p>
          )
        ) : (
          sortedConversations.map((convo) => renderUserItem(convo))
        )}
      </div>
    </div>
  );
};

export default DmsLeft;