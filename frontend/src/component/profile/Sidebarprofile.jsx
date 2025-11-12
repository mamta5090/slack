import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setUser } from "../../redux/userSlice";
import Avatar from "../Avatar"; // Make sure to import your Avatar component

const Sidebarprofile = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Selectors for User and Online Status ---
  const user = useSelector((state) => state.user.user); // Correctly access the nested user object
  const { onlineUsers = [] } = useSelector((state) => state.socket) || {};
 console.log("User object passed to Avatar:", user);
  // --- Determine if the user is online ---
  const isOnline = user && onlineUsers.includes(user._id);

  // --- Handle Logout ---
  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/logout");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      dispatch(setUser(null));
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --- Close dropdown on outside click or Escape key ---
  useEffect(() => {
    const handleClick = (e) => {
      if (
        open &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  if (!user) {
    // If there is no user, you might want to show a login button or nothing at all
    return null;
  }

  const profileRouteValue = user.username || user._id || "me";

  return (
    <div className="relative">
      {/* Profile Button with Avatar */}
      <button
        ref={buttonRef}
        type="button"
        className="relative" // Use relative positioning for the status dot
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Profile menu"
        aria-label="Profile menu"
      >
        <Avatar user={user} size="md" />
        <div
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
            isOnline ? "bg-green-500" : "bg-gray-500"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="absolute left-[80px] bottom-0 mb-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50"
          role="menu"
          aria-label="Profile menu options"
        >
          <div className="p-2">
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => {
                navigate(`/profile/${profileRouteValue}`);
                setOpen(false);
              }}
            >
              Profile
            </button>
            <button
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => {
                navigate("/settings"); // A more standard route for preferences
                setOpen(false);
              }}
            >
              Preferences
            </button>
            <hr className="my-2" />
            <button
              type="button"
              onClick={() => {
                handleLogout();
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebarprofile;