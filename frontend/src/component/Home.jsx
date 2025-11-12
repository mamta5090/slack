import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Topbar from '../pages/Topbar';
import Sidebar from '../pages/Sidebar';
import HomeRight from '../pages/HomeRight';
import Channel from '../pages/Channel';

const HomePage = () => {
  return (
    <div className="w-full h-screen bg-[#f3f4f6]">      <Topbar />
      <div className="flex h-full">
        <Sidebar />
        <HomePageSidebar />

        {/* This <main> section is where the content will change based on the URL */}
        <main className="flex-1 h-full pl-[calc(5%+25%)]">
          
          {/* 3. Replace the static components with a proper <Routes> block */}
          {/* This is the core logic that fixes your entire application's routing. */}
          <Routes>
            {/* When the URL is exactly "/", show a welcome screen */}
            <Route index element={<WelcomeScreen />} />

            {/* If the URL matches "/dm/:id", RENDER ONLY the HomeRight component */}
            <Route path="/dm/:id" element={<HomeRight />} />

            {/* If the URL matches "/channel/:channelId", RENDER ONLY the Channel component */}
            <Route path="/channel/:channelId" element={<Channel />} />
          </Routes>
          
        </main>
      </div>
    </div>
  );
};

// 4. Create this simple component (or in its own file) to avoid a blank screen
const WelcomeScreen = () => (
    <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Welcome!</h2>
            <p className="text-gray-500 mt-2">Select a channel or conversation to begin.</p>
        </div>
    </div>
);

export default HomePage;