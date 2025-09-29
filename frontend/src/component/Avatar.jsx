// src/components/Avatar.jsx

import React from "react";
import dp from '../assets/dp.webp'; // Default picture

const SERVER_URL = "http://localhost:5000"; // Your backend server URL

// Helper to construct the full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${SERVER_URL}/${path.replace(/\\/g, '/')}`;
};

const Avatar = ({ user, size = 'md' }) => {
  // Determine size classes based on the size prop
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',    // For Topbar
    md: 'w-[32px] h-[32px] text-sm', // For Left sidebar
    lg: 'w-28 h-28 text-4xl', // For Profile Page cards
    xl: 'w-56 h-56 text-8xl', // For Profile Page main avatar
  };

  const selectedSize = sizeClasses[size] || sizeClasses['md'];

  // Check if user exists and has a profile image
  const imageUrl = user ? getImageUrl(user.profileImage) : null;

  if (imageUrl || (user && dp)) {
    // If a profile image OR a default picture exists, show the <img> tag
    return (
      <img
        src={imageUrl || dp}
        alt={user?.name || 'User Avatar'}
        className={`${selectedSize} object-cover rounded-full`}
      />
    );
  }

  // Otherwise, show a styled <div> with the first letter of the name
  return (
    <div
      className={`${selectedSize} rounded bg-purple-600 flex items-center justify-center text-white font-bold`}
    >
      {user?.name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
};

export default Avatar;