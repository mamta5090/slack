import React from 'react'
import Topbar from '../../pages/Topbar'
import Sidebar from '../../pages/Sidebar'
import Left from '../../pages/Left'
import Right from '../../pages/Right'
import { Outlet } from 'react-router-dom'

const Dms = () => {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Topbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        {/* <div className="flex-shrink-0">
        <Left/>
        </div> */}
        <div className="flex-grow overflow-hidden">
         <Right/>
        </div>
      </div>
    </div>
  )
}

export default Dms
