// src/component/MainLayout.jsx

import React from "react";
// A comment explaining the change: Fixed the critical typo from "react--router-dom" to "react-router-dom".
import { Outlet } from "react-router-dom";
import Topbar from "../pages/Topbar";
import Sidebar from "../pages/Sidebar";
import Left from "../pages/Left";

const MainLayout = () => {
  return (
    // A comment explaining the change: The main container is set to the full screen height and prevents any overflow,
    // which is the primary fix for the page-level scrolling issue.
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Topbar is fixed and takes full width */}
      <div className="flex-shrink-0">
        <Topbar />
      </div>

      {/* Main content area below the Topbar */}
      {/* A comment explaining the change: This container fills the remaining vertical space and also prevents overflow. */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* Left Panel (Conversations) */}
        <div className="flex-shrink-0">
          <Left />
        </div>

        {/* Right Panel (Chat Window or other content) */}
        {/* A comment explaining the change: This container ensures the content within it (like the chat window) is properly constrained. */}
        <div className="flex-grow overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;