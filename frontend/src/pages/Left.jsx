import axios from "axios";
import React, { useEffect, useRef } from "react";
import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setUsers } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";

const Left = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);
  const containerRef = useRef(null);
  const location = useLocation();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }
      console.log("📡 Sending token:", token.slice ? token.slice(0, 40) + "..." : token);
      const result = await axios.get("http://localhost:5000/api/user/get", {
        headers: {
          "Content-Type": "application/json",
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
  className="w-[30%] h-[calc(100vh-48px)] bg-gray-700 overflow-y-auto no-scrollbar scroll-smooth pr-2"
>
      <div className="font-bold text-lg text-white p-[10px] flex justify-between items-center">
        <div>Koalaliving</div>
        <div className="flex gap-[15px] text-xl">
          <CiSettings className="cursor-pointer" />
          <FaRegEdit className="cursor-pointer" />
        </div>
      </div>

      <div className="text-white flex gap-[10px] p-[10px] items-center">
        <TbTriangleInvertedFilled />
        <p>Direct Message</p>
      </div>

      <div className="p-2">
        {users && users.length > 0 ? (
          users.map((user) => (
            <Link key={user._id} to={`/user/${user._id}`}>
              <div
                id={`user-${user._id}`}
                className="flex items-center gap-3 hover:bg-gray-600 text-white rounded-md p-2 mb-2 cursor-pointer"
              >
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
