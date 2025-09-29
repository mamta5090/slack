// src/components/ProfileTab.jsx

import React, { useState } from 'react';
import { CiStar, CiClock2, CiHeadphones } from "react-icons/ci";
import { BsCopy, BsEye, BsPin, BsPlusLg, BsLightning } from "react-icons/bs";
import Avatar from "../component/Avatar";
import { RiPhoneLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { IoIosNotificationsOutline, IoIosDocument, IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import { MdPersonSearch, MdKeyboardArrowDown, MdOutlineForwardToInbox, MdOutlineEmail } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { LuFile } from "react-icons/lu";
import { FiMessageCircle } from "react-icons/fi";
import { FaRegFolderClosed } from "react-icons/fa6";

const ProfileTab = ({
  openEdit,
  openEditTopic,
  addConversation,
  setOpenProfile,
  topic,
  saving,
  searchQuery,
  selectedUsers,
  searchResults,
  isOnline,
  singleUser,
  setOpenEdit,
  setOpenEditTopic,
  setAddConversation,
  handleTopicChange,
  handleCancel,
  handleSaveTopic,
  handleSelectUser,
  handleRemoveUser,
  handleCloseModal,
  handleCreateGroupConversation,
  setSearchQuery,
}) => {
  const [activeTab, setActiveTab] = useState('about');

  if (!singleUser) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="px-6 bg-[#f8f8f8] py-4 max-h-[340px]">
            <div className="shadow rounded-lg p-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">Topic</p>
                  <p className="font-medium text-sm">{topic || "Add a topic"}</p>
                </div>
                <button className="text-sm text-blue-600 font-semibold" onClick={() => { setOpenEdit(false); setOpenEditTopic(true); }}>Edit</button>
              </div>
            </div>
            <div className="mt-4 shadow rounded-lg py-3 px-4 bg-white">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm"><CiClock2 className="font-extrabold text-xl" /><span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} local time</span></div>
                <div className="flex flex-row gap-3 items-center"><RiPhoneLine className='text-lg' /><p className="text-blue-700 text-sm">112</p></div>
                {singleUser?.email && (<div className="flex items-center gap-2 text-sm"><MdOutlineForwardToInbox className='text-lg' /><p className="text-blue-600">{singleUser.email}</p></div>)}
                <p 
                    className="text-blue-600 font-medium mt-2 cursor-pointer text-sm" 
                    onClick={()=>setOpenProfile(true)} // <-- Used here
                >
                    View full profile
                </p>
              </div>
            </div>
            <div className="bg-white mt-4 rounded-xl font-semibold p-3 shadow flex flex-row cursor-pointer hover:bg-gray-50 text-sm" onClick={() => { setOpenEdit(false); setAddConversation(true); }}>
              Add people to this conversation
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
              <span>Channel ID:</span><span className="font-mono text-gray-700">{singleUser._id || "D098X21T2VC"}</span>
              <button type="button" onClick={() => { navigator.clipboard?.writeText(singleUser._id || ""); alert("Channel ID copied"); }} className="ml-auto"><BsCopy /></button>
            </div>
          </div>
        );
      case 'tabs':
        return (
            <div className="px-6 bg-[#f8f8f8] py-4 max-h-[340px] overflow-auto">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className='font-semibold text-md'>Manage tabs</p>
                  <p className='text-gray-900 text-sm'>Reorder, add, remove and hide the tabs that everyone sees in this channel.</p>
    
                  <div className='mt-4 flex flex-col gap-3'>
                    <div className='flex items-center justify-between'><div className='flex items-center gap-2'><FiMessageCircle className='text-lg text-gray-700' /><p>Messages</p></div></div>
                    <div className='flex items-center justify-between'><div className='flex items-center gap-2'><LuFile className='text-lg' /><p>Files</p></div><div className='flex items-center gap-2 border p-1 rounded-xl'><BsEye className='text-gray-500' /><IoIosArrowRoundUp /><IoIosArrowRoundDown /></div></div>
                    <div className='flex items-center justify-between'><div className='flex items-center gap-2'><FaRegFolderClosed className='text-lg text-gray-700' /><p>slack</p></div></div>
                    <div className='flex items-center justify-between'><div className='flex items-center gap-2'><IoIosDocument className='text-lg text-gray-700' /><p>Untitled</p></div></div>
                    <div className='flex items-center justify-between'><div className='flex items-center gap-2'><BsLightning className='text-lg' /><p>Workflows</p></div><p className='text-sm text-gray-500'>Hidden</p></div>
                    <div className='flex items-center justify-between'><div className='flex items-center gap-2'><BsPin className='text-lg' /><p>Pins</p></div><p className='text-sm text-gray-500'>Hidden</p></div>
                  </div>
                  <div className='flex items-center gap-2 mt-4 pt-4 border-t'><BsPlusLg className='text-lg text-gray-900' /><p className='text-gray-900'>New Tab</p></div>
                </div>
            </div>
        );
      case 'integrations':
        return (
            <div className="px-6 bg-[#f8f8f8] py-4 min-h-[340px]">
                <div className='bg-white rounded-lg shadow p-4 flex items-start gap-4'>
                   <div className='bg-[#e0edf2] p-1 rounded'><MdOutlineEmail className='text-2xl text-[#1264a3]' /></div>
                    <div>
                        <p className='font-semibold text-md'>Send emails to this conversation</p>
                        <p className='text-gray-900 text-sm mt-1'>Get an email address that posts incoming emails in this conversation.</p>
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {openEdit && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-16">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative">
            <div>
              <button className="absolute top-4 right-4 text-xl text-gray-600 cursor-pointer p-2" onClick={() => setOpenEdit(false)}><RxCross2 /></button>
              <div className="flex flex-row gap-4 py-4 px-6">
                <Avatar user={singleUser} size="lg" />
                <div className="flex p-2 flex-col justify-center gap-1">
                  <h1 className="text-2xl font-bold">{singleUser.name}</h1>
                  <p className="font-semibold text-sm">{singleUser.role}</p>
                </div>
              </div>
              <div className="mt-2 px-6 flex gap-2 flex-wrap">
                <div className="border h-[35px] w-[65px] rounded flex items-center justify-center cursor-pointer"><CiStar className="h-[20px] w-[20px]" /><MdKeyboardArrowDown className="h-[20px] w-[20px]" /></div>
                <button className="px-2 border rounded flex items-center gap-2 text-sm"><IoIosNotificationsOutline />Mute</button>
                <button className="px-3 border rounded flex items-center gap-2 text-sm"><CgProfile /> VIP</button>
                <button className="px-2 py-2 border rounded flex items-center text-sm"><MdPersonSearch />Hide</button>
                <button className="px-1 border rounded flex items-center gap-1 text-sm"><CiHeadphones /> Huddle ▾</button>
              </div>
              <div className="mt-6 px-6 flex flex-row gap-6 border-b-2">
                <button className={`font-semibold pb-2 ${activeTab === 'about' ? 'border-b-2 border-black' : 'text-gray-500'}`} onClick={() => setActiveTab('about')}>About</button>
                <button className={`font-semibold pb-2 ${activeTab === 'tabs' ? 'border-b-2 border-black' : 'text-gray-500'}`} onClick={() => setActiveTab('tabs')}>Tabs</button>
                <button className={`font-semibold pb-2 ${activeTab === 'integrations' ? 'border-b-2 border-black' : 'text-gray-500'}`} onClick={() => setActiveTab('integrations')}>Integrations</button>
              </div>
              {renderContent()}
            </div>
          </div>
        </div>
      )}

      {/* Edit Topic Modal */}
      {openEditTopic && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4">
          <div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Edit topic</h2>
              <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-5 overflow-y-auto">
              <input type="text" value={topic} onChange={handleTopicChange} className="border rounded-md p-2 hover:bg-[#f8f8f8]" />
              <p className="text-sm text-gray-700">Add a topic to your conversation with @{singleUser.name}. This will be visible to both of you at the top of your DM.</p>
            </div>
            <div className="flex items-center gap-3 py-4 px-6 justify-end border-t">
              <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button>
              <button type="button" onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Conversation Modal */}
      {addConversation && (
        <div className="inset-0 z-50 bg-black/50 items-center justify-center p-20 px-4 fixed flex">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b">
              <h2 className="text-xl font-bold">Add people</h2>
              <button onClick={handleCloseModal} className="text-xl text-gray-600" aria-label="Close modal"><RxCross2 /></button>
            </div>
            <div className="flex flex-col p-6 space-y-4 overflow-y-auto">
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {selectedUsers.map(u => (
                    <div key={u._id} className="flex items-center gap-2 bg-gray-200 rounded-full px-3 py-1 text-sm">
                      <span>{u.name}</span>
                      <button onClick={() => handleRemoveUser(u._id)} className="text-gray-600 hover:text-black"><RxCross2 /></button>
                    </div>
                  ))}
                </div>
              )}
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., Vijay or @vijay" className="border rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none" />
              {searchQuery.length > 0 && (
                <div className="border rounded-md max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <div key={result._id} onClick={() => handleSelectUser(result)} className="flex items-center gap-3 p-3 hover:bg-blue-100 cursor-pointer">
                        <div className="relative"><Avatar user={result} size="sm" />{isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />}</div>
                        <span className="font-semibold">{result.name}</span>
                      </div>
                    ))
                  ) : (<p className="p-3 text-gray-500">No people found.</p>)}
                </div>
              )}
            </div>
            <div className="flex justify-end p-4 border-t bg-gray-50">
              <button type="button" onClick={handleCreateGroupConversation} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={selectedUsers.length === 0}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;