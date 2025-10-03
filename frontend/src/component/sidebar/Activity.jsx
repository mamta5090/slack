import React, { useState } from 'react'
import Topbar from '../../pages/Topbar'
import Sidebar from '../../pages/Sidebar'
import Left from '../../pages/Left'

const Activity = () => {

const [allOpen,setAllOpen]=useState(true)
const [mentionsOpen,setMentionsOpen]=useState(false)
const [threadOpen,setThreadOpen]=useState(false)
const [ReactionsOpen,setReactionsOpen]=useState(false)
const [invitionOpen,setInvitionOpen]=useState(false)
const [activeTab,setActiveTab]=useState('All')

  return (
   <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Topbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
         
       
       <div className="md:w-[460px] w-[640px] ml-[72px] mt-12 h-[calc(100vh-3rem)] bg-[#5a2a5c] text-gray-200 flex flex-col">
        
  <div className="p-3  flex justify-between items-center">
                <h3 className="font-bold">Activity</h3>
                <label className="flex items-center text-xs cursor-pointer">
                  <span className="mr-2">Unread messages</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="block bg-gray-300 w-8 h-4 rounded-full peer-checked:bg-green-500"></div>
                    <div className="dot absolute left-1 top-0.5 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-full"></div>
                  </div>
                </label>
              </div>

              <div className='flex gap-3 p-3'>
                <p onClick={()=>setActiveTab('all')} className={`font-semibold cursor-pointer ${activeTab==='all' ? 'border-b-2 border-white':'text-gray-400'}`}>All</p>
                <p onClick={()=>setActiveTab('mention')} className={`font-semibold cursor-pointer ${activeTab==='mention' ? 'border-b-2 border-white':'text-gray-400'}`}>@Mention</p>
                <p onClick={()=>setActiveTab('thread')} className={`font-semibold cursor-pointer ${activeTab==='thread' ? 'border-b-2 border-white':"text-gray-400"}`}>@Thread</p>
                                <p onClick={()=>setActiveTab('reactions')} className={`font-semibold cursor-pointer ${activeTab==='reactions' ? 'border-b-2 border-white':'text-gray-400'}`}>Reactions</p>
                <p onClick={()=>setActiveTab('invitations')} className={`font-semibold cursor-pointer ${activeTab==='invitations' ? 'border-b-2 border-white':"text-gray-400"}`}>Invitations</p>
                </div>
         </div>

         <div className="px-6   w-full py-4 min-h-[340px]">
            {/*right box */}
         </div>
      </div>
    </div>
  )
}

export default Activity
