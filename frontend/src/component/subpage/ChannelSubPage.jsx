import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import axios from 'axios';

// --- Icon Imports ---
import { CiStar } from "react-icons/ci";
import { RiHeadphoneLine, RiArrowDownSLine } from "react-icons/ri";
import { RxCross2 } from "react-icons/rx";
import { BsInfoCircle } from "react-icons/bs";
import { FiCopy } from "react-icons/fi";
import { setAllChannels } from '../../redux/channelSlice'; // Assuming you have this action

// A small helper component for the sections in the "About" tab
const InfoSection = ({ title, value, onEdit, children }) => (
    <div className="py-4 border-b border-gray-200 last:border-b-0">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold">{title}</p>
                {/* Render either the value or custom children */}
                {value ? <p className="text-sm text-gray-700 mt-1">{value}</p> : children}
            </div>
            {onEdit && <button onClick={onEdit} className="text-sm text-blue-600 font-semibold hover:underline ml-4 flex-shrink-0">Edit</button>}
        </div>
    </div>
);


const ChannelSubPage = ({ channel, onClose }) => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState('about');
    const [openEditTopic, setOpenEditTopic] = useState(false);
    
    // State for the "Edit Topic" modal
    const [currentTopic, setCurrentTopic] = useState(channel.topic || '');
    const [isSaving, setIsSaving] = useState(false);

    const allUsers = useSelector((state) => state.user.allUsers);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --- Helper Functions ---
    const getUserNameById = (userId) => {
        const user = allUsers.find(u => u._id === userId);
        return user ? user.name : "Unknown User";
    };

    // --- API Handlers ---
    const handleSaveTopic = async () => {
        setIsSaving(true);
        try {
            // Your backend needs an endpoint to handle this update, e.g., PATCH
            await axios.patch(`/api/channel/${channel._id}`, { topic: currentTopic });
            
            // Refetch channels to ensure the whole app is in sync
            const res = await axios.get('/api/channel/getAllChannel');
            dispatch(setAllChannels(res.data));
            
            setOpenEditTopic(false); // Close modal on success
        } catch (error) {
            console.error("Failed to update topic:", error);
            alert("Error: Could not save the topic.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLeaveChannel = async () => {
        if (window.confirm(`Are you sure you want to leave #${channel.name}?`)) {
            try {
                await axios.delete(`/api/channel/${channel._id}/members/me`);
                const res = await axios.get('/api/channel/getAllChannel');
                dispatch(setAllChannels(res.data));
                alert(`You have left #${channel.name}.`);
                onClose();
                navigate('/');
            } catch (error) {
                console.error("Failed to leave channel:", error);
                alert("Error: Could not leave the channel.");
            }
        }
    };

    const copyChannelId = () => {
        navigator.clipboard.writeText(channel._id);
    };

    const createdByName = getUserNameById(channel.createdBy);
    const createdDate = format(new Date(channel.createdAt), 'd MMMM yyyy');

    // --- Tab Content Renderer ---
    const renderTabContent = () => {
        switch (activeTab) {
            case 'about':
                return (
                    <div>
                        <div className="p-4 bg-white shadow-md m-6 rounded-lg">
                            <InfoSection
                                title="Topic"
                                value={channel.topic || "Add a topic"}
                                onEdit={() => {
                                    setCurrentTopic(channel.topic || ''); // Reset text before opening
                                    setOpenEditTopic(true);
                                }}
                            />
                            <InfoSection
                                title="Description"
                                value={channel.description || "This channel is for working on a project. Hold meetings, share docs, and make decisions together with your team."}
                                onEdit={() => alert("Edit Description clicked")}
                            />
                            <InfoSection title="Managed by">
                                {channel.managedBy && channel.managedBy.length > 0 ? (
                                    <div className="flex items-center gap-1 text-sm mt-1">
                                        <BsInfoCircle className="text-gray-500" />
                                        <span className="text-blue-600 font-semibold">{getUserNameById(channel.managedBy?.[0])}</span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700 mt-1">Got questions? Ask an admin to add a channel manager to help things run smoothly.</p>
                                )}
                            </InfoSection>
                            <InfoSection
                                title="Created by"
                                value={`${createdByName} on ${createdDate}`}
                            />
                            
                            <div className="pt-4">
                                <button onClick={handleLeaveChannel} className="text-sm text-red-600 font-semibold hover:underline">
                                    Leave channel
                                </button>
                            </div>
                        </div>

                        <div className="flex  m-6 flex-col  h-full   bg-white rounded shadow-md p-4">
                            <h1 className='text-black font-semibold'>Files</h1>
                            <span>There aren’t any files to see here right now. But there could be – drag and drop any file into the message pane to add it to this conversation.</span>
                        </div>
                   </div>
                );
            case 'members':
                return <div className="p-4 text-center text-gray-500">Members list coming soon.</div>;
            default:
                return <div className="p-4 text-center text-gray-500">Content for {activeTab} is not available yet.</div>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center  justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl  flex flex-col max-h-[92vh]   ml-10 ">
                
                <header className=" p-4 border-b border-gray-200 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">#{channel.name}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-1 rounded-full">
                            <RxCross2 size={24} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100">
                            <CiStar className="mr-1" /> Star
                        </button>
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100">
                            All new posts <RiArrowDownSLine className="ml-1" />
                        </button>
                        <button className="flex items-center border border-gray-300 rounded px-2 py-1 text-sm hover:bg-gray-100">
                            <RiHeadphoneLine className="mr-1" /> Huddle
                        </button>
                    </div>
                </header>

                <nav className="flex items-center gap-4 px-4 border-b border-gray-200 flex-shrink-0">
                    {['about', 'members', 'tabs', 'integrations', 'settings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 text-sm font-semibold capitalize ${activeTab === tab ? 'text-black border-b-2 border-black' : 'text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {openEditTopic && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="bg-white w-full max-w-lg rounded-lg shadow-lg">
                            <div className="px-6 py-4 flex items-center justify-between border-b">
                                <h2 className="text-xl font-bold">Edit topic</h2>
                                <button onClick={() => setOpenEditTopic(false)} className="text-xl text-gray-600"><RxCross2 /></button>
                            </div>
                            <div className="p-6">
                                <textarea 
                                    value={currentTopic} 
                                    onChange={(e) => setCurrentTopic(e.target.value)} 
                                    className="w-full border rounded p-2 min-h-[100px]" 
                                    placeholder="Add a topic" 
                                />
                                <p className="text-xs text-gray-500 mt-2">Let people know what this channel is for.</p>
                            </div>
                            <div className="flex items-center justify-end gap-3 py-3 px-6 border-t bg-gray-50">
                                <button onClick={() => setOpenEditTopic(false)} className="px-4 py-2 border rounded font-semibold" disabled={isSaving}>Cancel</button>
                                <button onClick={handleSaveTopic} className="px-4 py-2 bg-green-600 text-white font-semibold rounded" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
      
                <main className="overflow-y-auto bg-[#f8f8f8]">
                    {renderTabContent()}
                </main>
                
                <footer className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Channel ID: {channel._id}</span>
                        <button onClick={copyChannelId} title="Copy Channel ID" className="hover:text-black">
                            <FiCopy />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ChannelSubPage;