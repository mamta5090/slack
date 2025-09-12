import React, { useState, useEffect, useRef } from "react"; // A comment explaining the change: Added hooks for state and refs.
import { CiClock2, CiSearch } from "react-icons/ci";
import { FaArrowRight, FaArrowLeft, FaBell } from "react-icons/fa"; // A comment explaining the change: Using FaBell icon for better styling.
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // A comment explaining the change: Added useDispatch.
import { selectUnreadConversations, fetchConversations } from "../redux/conversationSlice"; // A comment explaining the change: Importing selectors for notifications.
import axios from "axios";

const Topbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const unreadConversations = useSelector(selectUnreadConversations);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openChat = async (otherId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/conversation/read/${otherId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchConversations());
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
    navigate(`/user/${otherId}`);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full h-12 fixed bg-[#5a2a5c] text-white flex items-center justify-between shadow-md px-4 z-50">
      <div className="flex items-center gap-5 w-[36%]">
        <FaArrowLeft onClick={() => navigate(-1)} className="cursor-pointer" />
        <FaArrowRight onClick={() => navigate(1)} className="cursor-pointer" />
        <CiClock2 />
      </div>

      <div className="flex items-center bg-gray-700 rounded-md px-3 py-1">
        <input
          type="text"
          placeholder="Search Koalaliving..."
          className="bg-[#5a2a5c] text-white px-2 focus:outline-none w-64"
        />
        <CiSearch className="text-xl ml-2" />
      </div>

      <div className="flex items-center space-x-4">

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative cursor-pointer text-xl"
          >
            <FaBell />
            {unreadConversations.length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-xs flex items-center justify-center">
                {unreadConversations.length}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-gray-700 rounded-md shadow-lg border border-gray-600">
              <div className="p-3 border-b border-gray-600">
                <h3 className="font-semibold">Unread Messages</h3>
              </div>
              {unreadConversations.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {unreadConversations.map((convo) => (
                    <div
                      key={convo._id}
                      onClick={() => openChat(convo.other._id)}
                      className="flex items-center justify-between p-3 hover:bg-gray-600 cursor-pointer"
                    >
                      <p>
                        New message from{" "}
                        <span className="font-bold">{convo.other.name}</span>
                      </p>
                      <span className="min-w-[20px] h-[20px] px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {convo.unreadCount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-3 text-gray-400">No new messages</p>
              )}
            </div>
          )}
        </div>

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