import React from 'react';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Topbar from '../pages/Topbar';
import Sidebar from '../pages/Sidebar';
import HomeRight from '../pages/HomeRight';

const HomePage = () => {
  return (
    <div className="w-full h-screen flex flex-row overflow-hidden">
      <Topbar />
      <Sidebar />
      <div className='ml-[72px] mt-[48px]'>
        <HomePageSidebar />
      </div>
      <div className="flex-1 h-full bg-[#f3f4f6] ml-[350px] mt-[48px]">
        <HomeRight />
      </div>
    </div>
  );
};

export default HomePage;