import React from 'react';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Topbar from '../pages/Topbar';
import Sidebar from '../pages/Sidebar';

const HomePage = () => {
  return (
    <div className="w-full  h-full flex flex-row">
   <Topbar/>
   <Sidebar/>
    <div className='ml-[72px] mt-[48px]'>
        <HomePageSidebar />
    </div>


      <div className="flex-1 h-full bg-[#f3f4f6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Koalaliving</h1>
          <p className="text-gray-600 mt-2">Select a conversation or start a new one.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;