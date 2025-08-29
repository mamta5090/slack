import axios from "axios";
import React, { useEffect, useRef } from "react";
import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { Link } from "react-router-dom";
import { setUsers } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

const Left = () => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const containerRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      const result = await axios.get("http://localhost:5000/api/user/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setUsers(result.data));
    } catch (error) {
      console.error("❌ Error fetching users:", error.response?.data || error.message);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        dispatch(setUsers([]));
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-[280px] h-screen fixed left-[60px] bg-[#3f0e40] flex flex-col text-white overflow-y-auto no-scrollbar"
    >
      {/* Top workspace title */}
      <div className="font-bold text-lg p-4 flex justify-between items-center border-b border-gray-700">
        <div>Koalaliving</div>
        <div className="flex gap-4 text-xl">
          <CiSettings className="cursor-pointer" />
          <FaRegEdit className="cursor-pointer" />
        </div>
      </div>

      {/* Channels */}
      <div className="mt-4">
        <p className="uppercase text-xs text-gray-400 px-4 mb-2">Channels</p>
        <div className="flex flex-col">
          {["cyrus", "general", "hr-activities", "random"].map((channel) => (
            <div
              key={channel}
              className="px-4 py-2 text-sm hover:bg-[#350d36] cursor-pointer"
            >
              # {channel}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700 my-3"></div>

      {/* Direct Messages */}
      <div className="mt-2">
        <div className="flex items-center gap-2 px-4 text-gray-300 mb-2">
          <TbTriangleInvertedFilled size={14} />
          <p className="text-sm">Direct Messages</p>
        </div>

        <div className="flex flex-col">
          {users && users.length > 0 ? (
            users.map((user) => (
              <Link key={user._id} to={`/user/${user._id}`}>
                <div className="flex items-center gap-3 hover:bg-[#350d36] px-4 py-2 rounded-md cursor-pointer">
                  <div className="w-[28px] h-[28px] flex items-center justify-center rounded-full bg-purple-600 text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm">{user.name}</p>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-xs px-4">No users found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Left;
