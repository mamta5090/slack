// src/pages/HomeRight.jsx

import axios from "axios";
import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Redux Actions
import { setSingleUser } from "../redux/userSlice";

// Components and Icons
import Avatar from "../component/Avatar";
import { CiHeadphones } from "react-icons/ci";
import { IoMdMore } from "react-icons/io";
import { RiArrowDropDownLine } from "react-icons/ri";
import { RxCross1 } from "react-icons/rx";

const HomeRight = () => {
  // 1. Get the ID from the URL (e.g., from /user/68c3b...)
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Selectors
  const singleUser = useSelector((state) => state.user.singleUser);
  const { onlineUsers = [] } = useSelector((state) => state.socket);

  // Memoized online status
  const isOnline = useMemo(() => {
    if (!singleUser?._id) return false;
    return onlineUsers.some((onlineId) => String(onlineId) === String(singleUser._id));
  }, [onlineUsers, singleUser]);

  // 2. Effect to fetch user data when the URL ID changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        // If no ID in URL, clear the singleUser in Redux
        dispatch(setSingleUser(null));
        return;
      }

      try {
        // Get the token for authentication
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Make the API call to your backend to get user details
        // NOTE: Ensure this endpoint exists on your server!
        const res = await axios.get(`http://localhost:5000/api/user/${id}`, config);
        
        // Update Redux with the fetched user data
        dispatch(setSingleUser(res.data));
      } catch (error) {
        console.error("Error fetching single user:", error);
        dispatch(setSingleUser(null));
      }
    };

    fetchUser();
    
    // Cleanup function to clear user when unmounting or ID changes
    return () => {
        // Optional: dispatch(setSingleUser(null)); to avoid flickering old data
    };

  }, [id, dispatch]); // Re-run this effect when 'id' changes

  // 3. Conditional Rendering: What to show if no user is selected
  if (!id || !singleUser) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <img src="/path/to/empty-state-image.png" alt="Welcome" className="w-48 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Welcome to your Workspace</h2>
          <p className="text-gray-500 mt-2">Select a conversation from the sidebar to start chatting.</p>
        </div>
      </div>
    );
  }

  // 4. Render the chat header for the selected user
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b h-[49px] flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md -ml-1">
          <div className="relative">
            <Avatar user={singleUser} size="sm" />
            <div
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                isOnline ? "bg-[#2bac76]" : "hidden"
              }`}
            />
          </div>
          <p className="font-bold text-lg">{singleUser.name}</p>
        </div>

        <div className="flex items-center gap-1 text-gray-600">
          <div className="flex flex-row border rounded-md items-center">
            <div
              className="hover:bg-gray-100 rounded-l-md p-1.5 cursor-pointer h-8 w-8 flex items-center justify-center"
              title="Start a huddle"
            >
              <CiHeadphones className="text-xl" />
            </div>
            <div className="h-5 w-[1px] bg-gray-300"></div>
            <div className="hover:bg-gray-100 rounded-r-md p-1 cursor-pointer h-8 flex items-center justify-center">
              <RiArrowDropDownLine className="text-xl" />
            </div>
          </div>

          <div className="hover:bg-gray-100 rounded-md p-1.5 cursor-pointer h-8 w-8 flex items-center justify-center ml-2">
            <IoMdMore className="text-xl" />
          </div>
        </div>
      </div>

      {/* ... (Rest of your chat area: messages, input, etc.) ... */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center text-gray-500">
        Chat area for {singleUser.name} goes here.
      </div>
    </div>
  );
};

export default HomeRight;