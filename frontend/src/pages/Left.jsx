// src/pages/Left.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CiSettings, CiSearch } from "react-icons/ci";
import { FaRegEdit, FaEdit } from "react-icons/fa";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { fetchConversations, selectAllConversations } from "../redux/conversationSlice";
import { setAllUsers } from "../redux/userSlice";
import Koalaliving from "../component/koalaliving/Koalaliving";
import dp from '../assets/dp.webp'

const Left = () => {
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
          const res = await axios.get("http://localhost:5000/api/user/get", {
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

  const { unreadList, directList } = useMemo(() => {
    const unread = [];
    const direct = [];
    for (const convo of conversations) {
      if (convo.unreadCount > 0) {
        unread.push(convo);
      } else {
        direct.push(convo);
      }
    }
    unread.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    direct.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return { unreadList: unread, directList: direct };
  }, [conversations]);

  const openChat = async (otherId) => {
    if (!me?._id) {
      console.error("Cannot open chat: current user not loaded.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/conversation/",
        { senderId: me._id, receiverId: otherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchConversations());
    } catch (err) {
      console.error("Failed to create or get conversation:", err);
    }
    setSearchTerm("");
    navigate(`/user/${otherId}`);
  };

  const renderUserItem = (item, isConversation) => {
    const user = isConversation ? item.other : item;
    if (!user) return null;

    const isOnline = (onlineUsers || []).some((id) => String(id) === String(user._id));
    const hasUnread = isConversation && item.unreadCount > 0;
    const isActive = String(user._id) === String(activeChatId);

    return (
      <div
        key={user._id}
        onClick={() => openChat(user._id)}
        className={`flex items-center justify-between hover:bg-[#958197] hover:text-black rounded-md p-2 cursor-pointer ${
          isActive ? "bg-white text-black" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-[32px] h-[32px] flex items-center justify-center rounded-full text-sm font-bold ${
                isConversation ? "bg-blue-700" : "bg-blue-600"
              }`}
            >
              {user.name?.charAt(0)?.toUpperCase()}

             
            </div>
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-gray-700 ${
                isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            />
          </div>
          <p className="font-medium text-sm">{user.name}</p>
        </div>
        {hasUnread && (
          <span className="min-w-[20px] h-[20px] px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {item.unreadCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-[460px] ml-[72px] mt-12 h-[calc(100vh-3rem)] bg-[#5a2a5c] text-gray-200 flex flex-col">
      {/* Header */}
      <div className="text-white p-3 flex justify-between items-center border-b border-purple-900">
        <div className="flex flex-row items-center gap-[25px]">
          <Koalaliving />

          <div className="hover:bg-[#958197]">
            <CiSettings />
          </div>
          <div className="hover:bg-[#958197]">
            <FaEdit />
          </div>
        </div>

        <div className="flex gap-3 text-xl">
          <CiSettings className="cursor-pointer" />
          <FaRegEdit className="cursor-pointer" />
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#958197] text-white rounded-md py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          />
          <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Channels */}
        <div className="text-sm px-4 py-2 text-gray-300">Channels</div>
        <div className="flex flex-col space-y-1 px-2">
          <div className="hover:bg-[#958197] hover:text-black rounded-md px-3 py-1 cursor-pointer"># cyrus</div>
          <div className="hover:bg-[#958197] hover:text-black rounded-md px-3 py-1 cursor-pointer"># general</div>
          <div className="hover:bg-[#958197] hover:text-black rounded-md px-3 py-1 cursor-pointer"># hr-activities</div>
          <div className="hover:bg-[#958197] hover:text-black rounded-md px-3 py-1 cursor-pointer"># random</div>
          <div className="text-purple-300 px-3 py-1 cursor-pointer">+ Add channels</div>
        </div>

        {/* Direct Messages */}
        <div className="flex items-center gap-2 text-sm px-4 py-3 text-gray-300">
          <TbTriangleInvertedFilled />
          <span>Direct Messages</span>
        </div>

        <div className="px-2">
          {searchTerm ? (
            <>
              <div className="text-gray-300 text-xs uppercase tracking-wide px-2 mb-2">
                Search Results
              </div>
              {searchResults.length > 0 ? (
                searchResults.map((user) => renderUserItem(user, false))
              ) : (
                <p className="text-gray-400 text-sm px-2">No users found</p>
              )}
            </>
          ) : (
            <>
              {unreadList.length > 0 && (
                <div className="mb-2">
                  <div className="text-gray-300 text-xs uppercase tracking-wide px-2 mb-1">
                    Unread • {unreadList.length}
                  </div>
                  {unreadList.map((convo) => renderUserItem(convo, true))}
                </div>
              )}
              {directList.length > 0 ? (
                directList.map((convo) => renderUserItem(convo, true))
              ) : (
                allUsers
                  .filter((u) => String(u._id) !== String(me?._id))
                  .map((user) => renderUserItem(user, false))
              )}
              <div className="text-purple-300 px-3 py-2 cursor-pointer">+ Invite people</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Left;
