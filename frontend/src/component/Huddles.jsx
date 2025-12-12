import React, { useState, useEffect, useRef } from 'react';
import HomePageSidebar from './sidebar/HomePageSidebar';
import Sidebar from '../pages/Sidebar';
import Topbar from '../pages/Topbar';

const Huddles = () => {
 
  const [activeFilter, setActiveFilter] = useState(null); // 'all', 'with', 'in'
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(false);


  const containerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setActiveFilter(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full h-screen bg-[#f3f4f6] overflow-hidden font-sans" ref={containerRef}>
      
      <Topbar />
      <Sidebar />
      <HomePageSidebar />

      <div className="flex flex-col h-full md:ml-[30%] ml-[30%] md:w-[70%] w-[70%] pt-12 bg-white border-l border-gray-200 relative">
        
        <div className="px-6 py-3 border-b border-gray-200 flex justify-between items-center bg-white flex-shrink-0 z-20">
          <h1 className="text-lg font-bold text-gray-900">Huddles</h1>
          <button className="flex items-center gap-1 border border-gray-300 rounded text-sm font-medium px-3 py-1 hover:bg-gray-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New huddle
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="max-w-4xl">
            <h2 className="text-[15px] font-bold text-gray-900 mb-4">Recent huddles</h2>

            <div className="flex items-center gap-3 mb-6 relative z-30">
              
              <div className="relative">
                <FilterButton 
                  label="All huddles" 
                  isOpen={activeFilter === 'all'} 
                  onClick={() => setActiveFilter(activeFilter === 'all' ? null : 'all')} 
                />
                {activeFilter === 'all' && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-50">
                    <div className="flex items-center justify-between px-4 py-1.5  hover:bg-[#1264a3] hover:text-white cursor-pointer">
                      <span className="text-sm font-medium">All huddles</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div className="px-4 py-1.5 hover:bg-[#1264a3] hover:text-white cursor-pointer text-gray-700 text-sm">
                      Missed huddles
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <FilterButton 
                  label="With" 
                  isOpen={activeFilter === 'with'} 
                  onClick={() => setActiveFilter(activeFilter === 'with' ? null : 'with')} 
                />
                {activeFilter === 'with' && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50">
                     <div className="relative mb-2">
                        <input type="text" placeholder="Eg. Emily Anderson" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" autoFocus />
                        <svg className="absolute left-2.5 top-2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                     </div>
                     <div className="text-xs text-gray-500 font-semibold mb-2 mt-3">Suggestions</div>
                     <div className="flex items-center gap-2 p-1.5 bg-[#1264a3] rounded text-white cursor-pointer">
                        <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center border border-white/40">
                             <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop" className="w-5 h-5 rounded" alt="" />
                        <span className="text-sm">Nitish Khanna</span>
                     </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <FilterButton 
                  label="In" 
                  isOpen={activeFilter === 'in'} 
                  onClick={() => setActiveFilter(activeFilter === 'in' ? null : 'in')} 
                />
                {activeFilter === 'in' && (
                   <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-xl p-3 z-50">
                   <div className="relative mb-2">
                      <input type="text" placeholder="Eg. #project-unicorn" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" autoFocus />
                      <svg className="absolute left-2.5 top-2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                   </div>
                   <div className="text-xs text-gray-500 font-semibold mb-2 mt-3">Recent</div>
                   <div className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded cursor-pointer">
                      <div className="w-4 h-4 border border-gray-300 rounded flex items-center justify-center bg-white"></div>
                      <span className="text-gray-700 text-sm"># general</span>
                   </div>
                </div>
                )}
              </div>
            </div>

            <div className="relative">
                
                {hoveredItem && !menuOpen && (
                   <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1.5 px-3 rounded shadow-lg z-40 text-center whitespace-nowrap">
                       <p className="font-bold">Go to conversation</p>
                       <p className="text-gray-300 font-normal">Nitish Khanna</p>

                       <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                   </div>
                )}

                <div 
                    className="group border border-gray-200 rounded-lg p-3 flex items-center justify-between hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer bg-white relative z-10"
                    onMouseEnter={() => setHoveredItem(true)}
                    onMouseLeave={() => setHoveredItem(false)}
                >
                
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                        </svg>
                        </div>
                        <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-sm">Nitish Khanna</span>
                        <span className="text-xs text-gray-500 mt-0.5">3 months ago • 3 minutes</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                        <img className="w-6 h-6 rounded-md border-2 border-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="User" />
                        <img className="w-6 h-6 rounded-md border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" />
                        </div>

                        <div className="relative" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); setActiveFilter(null); }}>
                            <button className={`p-1 rounded transition-colors ${menuOpen ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="12" cy="5" r="1"></circle>
                                    <circle cx="12" cy="19" r="1"></circle>
                                </svg>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-8 w-60 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                                    <div className="flex items-center justify-between px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer group/item">
                                        <span className="text-sm">See participants</span>
                                        <span className="text-xs text-gray-400 group-hover/item:text-white">2 members</span>
                                    </div>
                                    <div className="px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer text-sm">Save for later</div>
                                    <div className="px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer text-sm">Copy huddle link</div>
                                    <div className="px-4 py-2 hover:bg-[#1264a3] hover:text-white cursor-pointer text-sm">Edit huddle topic</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

const FilterButton = ({ label, isOpen, onClick }) => {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-2 border px-3 py-1.5 rounded text-sm font-medium transition-colors ${isOpen ? 'bg-gray-100 border-gray-400 text-gray-900' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
    >
      {label}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" height="14" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
        className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
  );
};

export default Huddles;