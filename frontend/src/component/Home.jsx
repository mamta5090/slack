import React from 'react';
import HomePageSidebar from './sidebar/HomePageSidebar'; 
import Sidebar from '../pages/Sidebar';
import Topbar from '../pages/Topbar';

const HomePage = () => {
  return (
 <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Topbar is always present */}
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        {/* The thin icon Sidebar is always present */}
        <Sidebar />
        
        
           <div className='ml-[71px] mt-[48px]'>
             <HomePageSidebar/>
           </div>
          <div className="flex-1 h-full bg-[#f3f4f6] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Koalaliving</h1>
          <p className="text-gray-600 mt-2">Select a conversation or start a new one.</p>
        </div>
      </div>
      </div>
    </div>



    
  );
}

export default HomePage;