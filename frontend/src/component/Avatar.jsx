// src/component/Avatar.jsx

import React from "react";

// Define your backend URL in one place
const SERVER_URL = "http://localhost:5000"; 

/**
 * A helper function to construct the full image URL.
 * It handles cases where the path might already be a full URL.
 */
const getImageUrl = (path) => {
  if (!path) {
    return null; // Return null if there's no path
  }
  // If the path is already a full URL (from Google, Facebook, etc.), use it directly
  if (path.startsWith('http')) {
    return path;
  }
  // Otherwise, prepend the backend server URL
  return `${SERVER_URL}/${path}`;
};

const Avatar = ({ user, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    if (!user) {
        return <div className={`${sizeClasses[size]} bg-gray-300 rounded-full`}></div>;
    }

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
    
    // Use the helper function to get the correct, full image URL
    const imageUrl = getImageUrl(user.profileImage);

    return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} bg-gray-400 text-white rounded-full font-bold`}>
            {/* Use the constructed imageUrl here */}
            {imageUrl ? (
                <img src={imageUrl} alt={user.name} className="w-full h-full rounded-xl object-cover" />
            ) : (
                <span>{initial}</span>
            )}
        </div>
    );
};

export default Avatar;