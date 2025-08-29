// import axios from "axios";
// import React, { useEffect, useRef } from "react";
// import { CiSettings } from "react-icons/ci";
// import { FaRegEdit } from "react-icons/fa";
// import { TbTriangleInvertedFilled } from "react-icons/tb";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { setUsers } from "../redux/userSlice";
// import { useDispatch, useSelector } from "react-redux";

// const Left = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { users } = useSelector((state) => state.user);
//   const containerRef = useRef(null);
//   const location = useLocation();

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.warn("No token found, redirecting to login");
//         window.location.href = "/login";
//         return;
//       }
//       console.log("📡 Sending token:", token.slice ? token.slice(0, 40) + "..." : token);
//       const result = await axios.get("http://localhost:5000/api/user/get", {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       dispatch(setUsers(result.data));
//     } catch (error) {
//       console.error("❌ Error fetching users:", error.response?.data || error.message);
//       if (error.response?.status === 401) {
//         localStorage.removeItem("token");
//         dispatch(setUsers([]));
//         window.location.href = "/login";
//       }
//     }
//   };

//   useEffect(() => {
//     fetchUsers();

//   }, []);

//   return (
//    <div
//   ref={containerRef}
//   className="w-[30%] h-[calc(100vh-48px)] bg-gray-700 overflow-y-auto no-scrollbar scroll-smooth pr-2"
// >
//       <div className="font-bold text-lg text-white p-[10px] flex justify-between items-center">
//         <div>Koalaliving</div>
//         <div className="flex gap-[15px] text-xl">
//           <CiSettings className="cursor-pointer" />
//           <FaRegEdit className="cursor-pointer" />
//         </div>
//       </div>

//       <div className="text-white flex gap-[10px] p-[10px] items-center">
//         <TbTriangleInvertedFilled />
//         <p>Direct Message</p>
//       </div>

//       <div className="p-2">
//         {users && users.length > 0 ? (
//           users.map((user) => (
//             <Link key={user._id} to={`/user/${user._id}`}>
//               <div
//                 id={`user-${user._id}`}
//                 className="flex items-center gap-3 hover:bg-gray-600 text-white rounded-md p-2 mb-2 cursor-pointer"
//               >
//                 <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
//                   {user.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-semibold">{user.name}</p>
//                 </div>
//               </div>
//             </Link>
//           ))
//         ) : (
//           <p className="text-gray-400 text-sm p-2">No users found</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Left;
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
  const { users, user: loggedInUser } = useSelector((state) => state.user);
  const containerRef = useRef(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
<<<<<<< HEAD

=======
>>>>>>> 355e624d1066671853b29d7ce9fa859912465b13
      const result = await axios.get("http://localhost:5000/api/user/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setUsers(result.data));
    } catch (error) {
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

<<<<<<< HEAD
  return (
    <div
      ref={containerRef}
      className="w-[280px] h-screen fixed left-[60px] bg-[#3f0e40] flex flex-col text-white overflow-y-auto no-scrollbar"
    >
      {/* Top workspace title */}
      <div className="font-bold text-lg p-4 flex justify-between items-center border-b border-gray-700">
=======
  // ✅ hide the logged-in user
  const visibleUsers = Array.isArray(users)
    ? users.filter((u) => u._id !== loggedInUser?._id)
    : [];

  return (
    <div
      ref={containerRef}
      className="w-[30%] h-[calc(100vh-48px)] bg-gray-700 overflow-y-auto no-scrollbar scroll-smooth pr-2"
    >
      <div className="font-bold text-lg text-white p-[10px] flex justify-between items-center">
>>>>>>> 355e624d1066671853b29d7ce9fa859912465b13
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

<<<<<<< HEAD
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
=======
      <div className="p-2">
        {visibleUsers.length > 0 ? (
          visibleUsers.map((user) => (
            <Link key={user._id} to={`/user/${user._id}`}>
              <div
                id={`user-${user._id}`}
                className="flex items-center gap-3 hover:bg-gray-600 text-white rounded-md p-2 mb-2 cursor-pointer"
              >
                <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
                  {user.name.charAt(0).toUpperCase()}
>>>>>>> 355e624d1066671853b29d7ce9fa859912465b13
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
