import React from 'react';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Topbar from '../pages/Topbar';
import Sidebar from '../pages/Sidebar';
import HomeRight from '../pages/HomeRight';
import { useParams } from 'react-router-dom';

const HomePage = () => {
  const { id } = useParams();
  return (
    <div className="w-full h-screen bg-[#f3f4f6]">
      <Topbar />
      <div className="flex h-full">
        <Sidebar />
        <HomePageSidebar />
        <main className="flex-1 h-full  pl-[calc(5%+25%)]">
          <HomeRight key={id} /> 
        </main>
      </div>
    </div>
  );
};

export default HomePage;