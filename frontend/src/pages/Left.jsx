import axios from "axios";
import React, { useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { Link } from "react-router-dom";

const Left = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      // ✅ If you’re using JWT Auth
      const token = localStorage.getItem("token");

      const result = await axios.get("http://localhost:5000/api/user/get", {
        withCredentials: true, // for cookie-based auth
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {}, // attach token only if available
      });

      setUsers(result.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-[30%] h-[calc(100vh-48px)] bg-gray-700">
      {/* Header */}
      <div className="font-bold text-lg text-white p-[10px] flex justify-between items-center">
        <div>Koalaliving</div>
        <div className="flex gap-[15px] text-xl">
          <CiSettings />
          <FaRegEdit />
        </div>
      </div>

      {/* Section Title */}
      <div className="text-white flex gap-[10px] p-[10px] items-center">
        <TbTriangleInvertedFilled />
        <p>Direct Message</p>
      </div>

      {/* Users List */}
      <div className="p-2">
        {users.length > 0 ? (
          users.map((user) => (
            <Link key={user._id} to={`/user/${user._id}`}>
              <div className="flex items-center gap-3 hover:bg-gray-600 text-white rounded-md p-2 mb-2 cursor-pointer">
                <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 text-sm p-2">No users found</p>
        )}
      </div>
    </div>
  );
};

export default Left;
