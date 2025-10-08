import React, { useEffect, useState } from 'react';
import { IoClose, IoChevronBack } from "react-icons/io5";
import { FaLink } from "react-icons/fa6";
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setAllChannels, setChannel } from '../../redux/channelSlice.js'

const NewChannel = () => {
    // --- FIX: Removed unused local state. Redux handles this now. ---
    // const [channels, setChannels] = useState([]);
     const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [channelsOpen, setChannelsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [channelName, setChannelName] = useState('slack-group');
    const [visibility, setVisibility] = useState('public');
    const [showAllTemplates, setShowAllTemplates] = useState(false);
    const [openAddChannel, setOpenAddChannel] = useState(false);

    const dispatch = useDispatch();
    // This will now work because the store is configured correctly
    const { channel, allChannels } = useSelector((state) => state.channel);

    const handleNext = () => setStep(2);
    const handleBack = () => setStep(1);
    const handleClose = () => {
        setChannelsOpen(false);
        setTimeout(() => setStep(1), 300);
    };

    const fetchAllChannels = async () => {
        try {
            // --- FIX: Use the correct, RESTful API endpoint ---
            const result = await axios.get('http://localhost:5000/api/channel', { withCredentials: true });
            dispatch(setAllChannels(result.data));
            console.log("Fetched channels:", result.data);
        } catch (error) {
            // --- FIX: Typo from 'console.llog' to 'console.log' ---
            console.log("error fetching channel:", error.response?.data || error.message);
        }
    };

    const handleChannel = async (e) => {
        e.preventDefault()
        setLoading(false)
        try {
            const result = await axios.post(
                'http://localhost:5000/api/channel/create',
                { name: channelName, visibility: visibility },
                { withCredentials: true }
            );
            dispatch(setChannel(result.data));
            setLoading(false)
            // --- FIX: This is CRITICAL for the UI to update after creating a new channel ---
            await fetchAllChannels(); 
            console.log("Created channel:", result.data);
            handleClose();
        } catch (error) {
            console.error("Error creating channel:", error.response?.data || error.message);
            setLoading(false)
            setError(error.message.data)
        }
    };

    useEffect(() => {
        fetchAllChannels();
    }, []);


    return (
        <div>
            <div className='flex p-2 gap-2 hover:bg-[#350d36] hover:rounded cursor-pointer text-white' onClick={() => setOpenAddChannel(prev => !prev)}>
                <div className='bg-gray-700 px-2 rounded'>+</div>
                <p>Add channels</p>
            </div>

            {/* Your list of channels, correctly rendered from Redux state */}
            <div className="p-2 text-white">
                <h3 className="font-bold mb-2">Channels</h3>
                <ul>
                    {allChannels && allChannels.map((ch) => (
                        <li key={ch._id} className="p-1 px-2 rounded hover:bg-[#350d36] cursor-pointer truncate">
                            # {ch.name}
                        </li>
                    ))}
                </ul>
            </div>

            {openAddChannel && (
                <div className="fixed inset-0 z-50 flex items-center ml-20 mt-30 px-4 ">
                    <div className='w-[160px] h-[100px] bg-white text-black rounded inset-0 flex flex-col  justify-center z-50 transition-opacity'>
                        <div className='px-2 hover:bg-blue-600 hover:text-white cursor-pointer' onClick={() => { setChannelsOpen(true); setOpenAddChannel(false); }}>Create a new channel</div>
                        <div className='px-2 hover:bg-blue-600 hover:text-white mt-2 cursor-pointer'>Browse channel</div>
                    </div>
                </div>
            )}

            {channelsOpen && (
                // ... your modal JSX ...
                 <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
                 <div className="bg-white w-[90%] max-w-[800px] h-[500px] rounded-lg shadow-lg z-50 flex relative">
                     {/* Right Side Buttons */}
                     <div className="absolute top-4 right-4 flex items-center space-x-4 text-gray-500">
                          {step === 2 && <FaLink size={20} className="hover:text-gray-800 cursor-pointer" />}
                         <button className="hover:text-gray-800" onClick={handleClose}>
                             <IoClose size={24} />
                         </button>
                     </div>

                     {/* Left side */}
                     <div className='bg-white text-black p-6 w-[45%] h-full flex flex-col rounded-l-lg'>
                         {step === 1 ? (
                             <>
                                 <h1 className='font-bold text-2xl mb-4'>Create a channel</h1>
                                 <div className='flex-grow overflow-y-auto pr-2'>
                                     <div className='bg-blue-600 p-2 text-white rounded cursor-pointer ring-2 ring-blue-300'>Blank channel</div>
                                     <div className='mt-3 space-y-1 text-gray-800'>
                                         {/* Templates */}
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Project starter kit</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Help requests process</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Team support</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Feedback intake and triage</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>New hire onboarding</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>1:1 coaching</div>
                                         <div className='hover:bg-gray-100 p-2 rounded cursor-pointer'>Sales deal tracking</div>
                                         <button className='text-blue-600 font-semibold hover:underline mt-1 p-2 w-full text-left' onClick={() => setShowAllTemplates(p => !p)}>
                                             {showAllTemplates ? "Show fewer templates" : "Show all templates"}
                                         </button>
                                     </div>
                                 </div>
                                 <div className="mt-auto pt-4 flex justify-end">
                                     <button className="bg-green-700 text-white font-bold py-2 px-6 rounded hover:bg-green-800" onClick={handleNext}>Next</button>
                                 </div>
                             </>
                         ) : (
                             <>
                                 <button onClick={handleBack} className="flex items-center text-sm font-semibold mb-3 hover:underline">
                                     <IoChevronBack className="mr-1" /> Back
                                 </button>
                                 <h1 className='font-bold text-2xl mb-4'>Channel details</h1>
                                 <div className='flex-grow pr-2'>
                                     <label htmlFor="channel-name" className='font-semibold'>Channel name</label>
                                     <div className="relative mt-1">
                                         <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>#</span>
                                          <input
                                             id="channel-name"
                                             type="text"
                                             value={channelName}
                                             onChange={(e) => setChannelName(e.target.value.replace(/\s/g, '-').toLowerCase())}
                                             className='w-full border-2 border-gray-400 rounded p-2 pl-6 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                         />
                                         <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm'>
                                             {80 - channelName.length}
                                         </span>
                                     </div>
                                     <p className="text-xs text-gray-500 mt-2">
                                         Channels are where conversations happen around a topic. Use a name that is easy to find and understand.
                                     </p>

                                     <div className='mt-6'>
                                         <p className='font-semibold'>Visibility</p>
                                         <div className='mt-2 space-y-3'>
                                             <label className='flex items-start cursor-pointer'>
                                                 <input type="radio" name="visibility" value="public" checked={visibility === 'public'} onChange={() => setVisibility('public')} className="mt-1 mr-2" />
                                                 <div>
                                                     <p className='font-semibold'>Public - <span className='font-normal'>Anyone in Koalaliving</span></p>
                                                 </div>
                                             </label>
                                              <label className='flex items-start cursor-pointer'>
                                                 <input type="radio" name="visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} className="mt-1 mr-2" />
                                                 <div>
                                                     <p className='font-semibold'>Private - <span className='font-normal'>Only specific people</span></p>
                                                     <p className="text-xs text-gray-500">Can only be viewed or joined by invitation</p>
                                                 </div>
                                             </label>
                                         </div>
                                     </div>
                                 </div>
                                  <div className="mt-auto pt-4 flex justify-center">
                                 {error ? <p className="text-red-600 text-sm mb-2">{error}</p> : null}
                                    <button 
                                        className="bg-green-700 text-white font-bold py-2 px-6 rounded hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed" 
                                        disabled={!channelName || loading} 
                                        onClick={handleChannel}
                                      >
                                          {loading ? "Creating..." : "Create"}
                                      </button>
                                 </div>
                             </>
                         )}
                     </div>

                     {/* Right side (Preview) */}
                     <div className='bg-[#F8F3FA] w-[55%] h-full p-6 flex flex-col rounded-r-lg'>
                         <div className='flex items-center text-gray-800 mb-4 font-bold text-lg truncate'>
                             <span>#</span>
                             <span className='ml-1 truncate'>{channelName || 'channel-name'}</span>
                         </div>
                         <div className='flex space-x-4 border-b mb-4'>
                             <button className='font-semibold text-gray-900 border-b-2 border-gray-900 pb-2'>Messages</button>
                             <button className='text-gray-500 pb-2'>Canvas</button>
                         </div>
                         <div className="flex-grow space-y-4 animate-pulse">
                             {[...Array(3)].map((_, i) => (
                                 <div key={i} className="flex items-start space-x-3">
                                     <div className="w-9 h-9 bg-gray-300 rounded"></div>
                                     <div className="flex-1 space-y-2 py-1">
                                         <div className="w-3/4 h-3 bg-gray-300 rounded"></div>
                                         <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                         <div className="mt-auto pt-4 relative">
                             <div className="border rounded-lg bg-white p-3 flex justify-between items-center text-gray-300">
                                 <span>&#43;</span>
                                 <div className="flex-grow mx-2"></div>
                                 <span className='text-xl'>&#10148;</span>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
            )}
        </div>
    );
};

export default NewChannel;