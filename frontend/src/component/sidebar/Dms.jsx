import React from 'react';
import { useParams } from 'react-router-dom';

// Import the child components for the layout
import Sidebar from '../../pages/Sidebar';   // Column 1: The narrow icon sidebar
import DmsLeft from '../../pages/DmsLeft';   // Column 2: The list of conversations
import HomeRight from '../../pages/HomeRight'; // Column 3: The main chat window
import Topbar from '../../pages/Topbar';     // The top navigation bar

const Dms = () => {
  const { id } = useParams(); // Get the user ID from the URL, if it exists

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Topbar sits above the main content */}
      <Topbar />

      {/* Main content area uses flex-1 to take up remaining vertical space */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Column 1: Icon Sidebar */}
        <Sidebar />
        
        {/* Column 2: Direct Messages List */}
        <DmsLeft />
        
        {/* Column 3: Main Chat Area */}
        <main className="flex-1 h-full">
          {/* We pass a `key` to HomeRight to force it to re-mount and re-fetch data 
              when the user ID in the URL changes. This is a crucial React pattern. */}
          <HomeRight key={id} /> 
        </main>
      </div>
    </div>
  );
};

export default Dms;