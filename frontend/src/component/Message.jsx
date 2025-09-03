import React from 'react'
import MsgLeft from '../pages/MsgLeft'
import MsgArea from '../pages/MsgArea'
import Topbar from '../pages/Topbar'
import Sidebar from '../pages/Sidebar'

const Message = () => {
  return (
       <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Topbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-shrink-0">
          <MsgLeft />
        </div>
        <div className="flex-grow overflow-hidden">
          <MsgArea />
        </div>
      </div>
    </div>
  )
}

export default Message
