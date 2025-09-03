import React from 'react'

const Activity = () => {
  return (
   <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Topbar />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex flex-col">
          
          <div>

          </div>

          <div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

export default Activity
