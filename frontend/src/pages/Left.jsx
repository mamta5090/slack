import axios from "axios";
import React, { useEffect, useState } from "react";
import { CiSettings } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { TbTriangleInvertedFilled } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import {setUsers} from '../redux/userSlice'
import { useDispatch, useSelector } from "react-redux";

const Left = () => {
  const navigate=useNavigate()
  //const [users, setUsers] = useState([]);
 const dispatch = useDispatch();
 const {users}=useSelector((state)=>state.user)
 
 const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const result = await axios.get("http://localhost:5000/api/user/get", {
        withCredentials: true, 
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      dispatch(setUsers(result.data));
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="w-[30%] h-[calc(100vh-48px)] bg-gray-700">
     
      <div className="font-bold text-lg text-white p-[10px] flex justify-between items-center">
        <div>Koalaliving</div>
        <div className="flex gap-[15px] text-xl">
          <CiSettings className="cursor-pointer"/>
          <FaRegEdit className="cursor-pointer"/>
        </div>
      </div>

   
      <div className="text-white flex gap-[10px] p-[10px] items-center">
        <TbTriangleInvertedFilled />
        <p>Direct Message</p>
      </div>

    
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
