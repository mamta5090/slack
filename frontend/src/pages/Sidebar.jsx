// src/components/Sidebar.jsx

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";
import { LuMessagesSquare, LuPencilRuler } from "react-icons/lu";
import { IoMdNotifications, IoIosMore } from "react-icons/io";
import { CiSaveDown2 } from "react-icons/ci";
import { FaFileAlt } from "react-icons/fa";
import { BsArrowUpRightCircleFill } from "react-icons/bs";
import { HiDocumentDuplicate } from "react-icons/hi";
import { GoFileDirectory } from "react-icons/go"; // Icon for Files
import Sidebarprofile from "../component/profile/Sidebarprofile";

// Mock Data Definitions
const dmsData = [
  { name: "Nitish Khanna", message: "You: hmm sir kr rhi hu", time: "4:41 PM", avatar: "N" },
  { name: "Vijay Laxmi Singh", message: "good", time: "Thursday", avatar: "V" },
  { name: "Anish", message: "ok", time: "17 September", avatar: "A" },
  { name: "Shubham Agrawal", message: "You: app jb free ho tb bataiyega", time: "12 September", avatar: "S" },
  { name: "Baldeep Singh", message: "You: Ok sir", time: "10 September", avatar: "B" },
];

const activityData = [
  { type: 'thread', people: 'Priyanka Pandey, Ankur Singh and 19 others', channel: '#hr-activities', message: "replied to: @here...", time: 'Thursday' },
  { type: 'reaction', person: 'Vijay Laxmi Singh', message: 'reacted to your message', time: 'Tuesday' },
  { type: 'mention', person: 'Baldeep Singh', channel: '#hr-activities', message: '@channel', time: '18 September' },
];

const laterData = [
  { type: 'Canvas', title: 'Untitled', updated: 'Updated 5 days ago' },
  { type: 'Template', title: 'Weekly 1:1', updated: 'Updated 1 month ago' },
];

// Added missing filesData
const filesData = [
  { title: 'Untitled', updated: 'Updated 5 days ago', isTemplate: false },
  { title: 'Weekly 1:1', updated: 'Updated 1 month ago', isTemplate: true },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [laterOpen, setLaterOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [dmsOpen, setDmsOpen] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);

  const moreMenuRef = useRef(null);
  const moreButtonRef = useRef(null);

  const moreItems = [
    { title: "Authentication", desc: "Authentication helpers & examples" },
    { title: "Canvas", desc: "Design and sketch features" },
    { title: "Lists", desc: "Predefined list templates" },
    { title: "Files", desc: "Manage your files", action: () => navigate("/files") },
    { title: "Channels", desc: "Workspace channels" },
    { title: "People", desc: "Manage people & profiles", action: () => navigate(`/profilepage`) },
    { title: "External connection", desc: "Connect external tools" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target) && // Corrected typo here
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target)
      ) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className="bg-[#3f0c41] fixed w-[72px] flex flex-col justify-between items-center py-4 shadow-lg top-12 bottom-0 z-50"
      aria-label="Sidebar"
    >
      <button
        onClick={() => navigate("/")}
        type="button"
        className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xl cursor-pointer"
        aria-label="Go to Home"
      >
        K
      </button>

      <div className="flex flex-col gap-2 items-center text-white space-y-5">
        
        {/* Home */}
        <button type="button" className="sidebar-btn" onClick={() => navigate("/homepage")}>
          <div className="hover:bg-[#5a2a5c] p-2 rounded-xl"><RiHome4Fill className="text-xl" /></div>
          <span className="text-xs mt-1">Home</span>
        </button>

        {/* DMs */}
        <div className="relative" onMouseLeave={() => setDmsOpen(false)}>
          <button type="button" className="sidebar-btn" onClick={() => navigate("/dms")} onMouseEnter={() => setDmsOpen(true)}>
            <div className="hover:bg-[#5a2a5c] p-2 rounded-xl"><LuMessagesSquare className="text-xl" /></div>
            <span className="text-xs mt-1">DMs</span>
          </button>
          {dmsOpen && (
            <div className="absolute left-full  -translate-y-1/2 ml-2 w-[350px] min-h-[500px] rounded-lg bg-white shadow-lg border border-gray-200 z-50 text-black">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-bold">Direct messages</h3>
                <label className="flex items-center text-xs cursor-pointer">
                  <span className="mr-2">Unread messages</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="block bg-gray-300 w-8 h-4 rounded-full peer-checked:bg-green-500"></div>
                    <div className="dot absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-full"></div>
                  </div>
                </label>
              </div>
              <div className="p-2">
                {dmsData.map((dm, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3">{dm.avatar}</div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{dm.name}</span>
                        <span className="text-xs text-gray-500">{dm.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">{dm.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="relative" onMouseLeave={() => setActivityOpen(false)}>
          <button type="button" className="sidebar-btn" onClick={() => navigate("/activity")} onMouseEnter={() => setActivityOpen(true)}>
            <div className="hover:bg-[#5a2a5c] p-2 rounded-xl"><IoMdNotifications className="text-xl" /></div>
            <span className="text-xs mt-1">Activity</span>
          </button>
          {activityOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[350px] min-h-[500px] rounded-lg bg-white shadow-lg border border-gray-200 z-50 text-black">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-bold">Activity</h3> {/* Corrected header */}
              </div>
              {activityData.map((item, index) => (
                <div key={index} className="p-3 hover:bg-gray-100 border-b cursor-pointer">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Thread in {item.channel}</span>
                    <span>{item.time}</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center font-bold text-gray-600 mr-3 shrink-0">
                      {item.people ? item.people.charAt(0) : item.person.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-bold">{item.people || item.person}</span> {item.message}
                      </p>
                      {item.type === 'thread' && <p className="text-xs text-gray-500 bg-gray-100 p-1 rounded border">{item.message}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        <div className="relative" onMouseLeave={() => setFilesOpen(false)}>
          <button type="button" className="sidebar-btn" onClick={() => navigate("/files")} onMouseEnter={() => setFilesOpen(true)}>
            <div className="hover:bg-[#5a2a5c] p-2 rounded-xl"><GoFileDirectory className="text-xl" /></div>
            <span className="text-xs mt-1">Files</span>
          </button>
          {filesOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-[350px] min-h-[500px] rounded-lg bg-white shadow-lg border border-gray-200 z-50 text-black">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-bold">Files</h3>
                <div>
                  <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100 mr-2">New canvas</button>
                  <button className="px-3 py-1 text-sm border rounded-md hover:bg-gray-100">New list</button>
                </div>
              </div>
              <div className="p-2">
                {filesData.map((file, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer">
                    <div className="w-8 h-8 rounded-md bg-[#1bb6eb] flex items-center justify-center mr-3 shrink-0">
                      <HiDocumentDuplicate className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center">
                        {file.title}
                        {file.isTemplate && <span className="ml-2 text-xs font-semibold text-gray-500 border rounded-md px-1.5 py-0.5">Template</span>}
                      </p>
                      <p className="text-xs text-gray-500">{file.updated}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Later */}
        <div className="relative" onMouseLeave={() => setLaterOpen(false)}>
          <button type="button" className="sidebar-btn" onClick={() => navigate("/later")} onMouseEnter={() => setLaterOpen(true)}>
            <div className="hover:bg-[#5a2a5c] p-2 rounded-xl"><CiSaveDown2 className="text-xl" /></div>
            <span className="text-xs mt-1">Later</span>
          </button>
          {laterOpen && (
            <div className="absolute left-full  -translate-y-1/2 ml-2 w-[350px] min-h-[490px] top-0 rounded-lg bg-white shadow-lg border border-gray-200 z-50 text-black">
              <div className="flex border-b justify-between items-center p-3">
                <h3 className="font-bold">Later</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">5 in progress</p>
                  <BsArrowUpRightCircleFill className="text-gray-500 cursor-pointer" />
                </div>
              </div>
              <div className="p-2">
                {laterData.map((item, index) => (
                    <div key={index} className="p-2 hover:bg-gray-100 rounded-md cursor-pointer border-b last:border-b-0">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{item.type}</p>
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-[#1bb6eb] flex rounded-md items-center justify-center mr-3">
                                <FaFileAlt className="text-white" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{item.title}</p>
                                <p className="text-xs text-gray-500">{item.updated}</p>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* More */}
        <div className="relative" onMouseLeave={() => setMoreMenuOpen(false)}>
          <button ref={moreButtonRef} type="button" className="sidebar-btn" onClick={() => setMoreMenuOpen(!moreMenuOpen)} onMouseEnter={() => setMoreMenuOpen(true)} aria-haspopup="true" aria-expanded={moreMenuOpen}>
            <div className="hover:bg-[#5a2a5c] p-2 rounded-xl"><IoIosMore className="text-xl" /></div>
            <span className="text-xs mt-1">More</span>
          </button>
          {moreMenuOpen && (
            <div ref={moreMenuRef} className="absolute left-full bottom-0 ml-2 w-[350px] min-h-[500px] rounded-xl bg-white shadow-lg border border-gray-200 p-3 z-50" role="menu">
              <p className="text-black font-semibold mb-3 px-2">More</p>
              <div className="flex flex-col gap-1">
                {moreItems.map((item, idx) => (
                  <button key={idx} type="button" onClick={() => { if (item.action) item.action(); setMoreMenuOpen(false); }} className="flex flex-row items-start text-black gap-3 cursor-pointer hover:bg-gray-100 rounded p-2 text-left" role="menuitem">
                    <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-xl p-2 flex items-center justify-center shrink-0">
                      <LuPencilRuler />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <button
          type="button"
          className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white text-2xl cursor-pointer"
          title="Create"
          onClick={() => navigate("/create")}
        >
          +
        </button>
        <Sidebarprofile />
      </div>
    </nav>
  );
};

export default Sidebar;