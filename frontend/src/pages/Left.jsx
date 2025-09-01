import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CiSettings, CiSearch } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { fetchConversations, selectAllConversations } from "../redux/conversationSlice";
import { setAllUsers } from "../redux/userSlice";

const Left = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const me = useSelector((s) => s.user.user);
  const { allUsers } = useSelector((s) => s.user);
  const conversations = useSelector(selectAllConversations);
  const { onlineUsers } = useSelector((s) => s.socket);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchConversations());
    if (allUsers.length === 0) {
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

  // A comment explaining the change: Memoized value for global user search results.
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedFilter = searchTerm.toLowerCase();
    return allUsers
      .filter((u) => String(u._id) !== String(me?._id))
      .filter((u) => u.name.toLowerCase().includes(lowercasedFilter));
  }, [searchTerm, allUsers, me?._id]);

  // A comment explaining the change: Memoized values to create two separate, sorted lists for the UI.
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
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/conversation/read/${otherId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchConversations());
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
    setSearchTerm(""); // Clear search on selection
    navigate(`/user/${otherId}`);
  };

  // A comment explaining the change: A reusable component to render each user/conversation item.
  const renderUserItem = (item, isConversation) => {
    const user = isConversation ? item.other : item;
    if (!user) return null;

    const isOnline = onlineUsers.includes(user._id);
    const hasUnread = isConversation && item.unreadCount > 0;

    return (
      <div
        key={user._id}
        onClick={() => openChat(user._id)}
        className="flex items-center justify-between hover:bg-gray-600 text-white rounded-md p-2 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-[40px] h-[40px] flex items-center justify-center rounded-full text-lg font-bold ${isConversation ? 'bg-purple-600' : 'bg-blue-600'}`}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${
                isOnline ? "bg-green-500" : "bg-gray-500"
              }`}
            ></div>
          </div>
          <p className="font-semibold">{user.name}</p>
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
    <div className="w-[30%] h-[calc(100vh-48px)] bg-gray-700 overflow-y-auto no-scrollbar scroll-smooth pr-2">
      <div className="font-bold text-lg text-white p-[10px] flex justify-between items-center">
        <div>Koalaliving</div>
        <div className="flex gap-[15px] text-xl">
          <CiSettings className="cursor-pointer" />
          <FaRegEdit className="cursor-pointer" />
        </div>
      </div>

      <div className="p-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search or start a new chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        </div>
      </div>

      <div className="text-white flex gap-[10px] p-[10px] items-center">
        <TbTriangleInvertedFilled />
        <p>Direct Messages</p>
      </div>

      <div className="px-2">
        {searchTerm ? (
          // A comment explaining the change: Show global search results when typing.
          <div>
            <div className="text-gray-300 text-xs uppercase tracking-wide px-2 mb-2">
              Search Results
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((user) => renderUserItem(user, false))
            ) : (
              <p className="text-gray-500 text-sm px-2">No users found</p>
            )}
          </div>
        ) : (
          // A comment explaining the change: Show the default two-list view when not searching.
          <>
            {/* UNREAD Section */}
            {unreadList.length > 0 && (
              <div className="mb-4">
                <div className="text-gray-300 text-xs uppercase tracking-wide px-2 mb-2">
                  Unread <span>• {unreadList.length}</span>
                </div>
                {unreadList.map((convo) => renderUserItem(convo, true))}
              </div>
            )}

            {/* DIRECT MESSAGES Section */}
            <div>
              <div className="text-gray-300 text-xs uppercase tracking-wide px-2 mb-2">
                Direct Messages
              </div>
              {directList.length > 0 ? (
                directList.map((convo) => renderUserItem(convo, true))
              ) : conversations.length > 0 ? (
                <p className="text-gray-500 text-sm px-2">No other conversations</p>
              ) : (
                // Suggestions for brand-new users
                allUsers
                  .filter((u) => String(u._id) !== String(me?._id))
                  .map((user) => renderUserItem(user, false))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Left;