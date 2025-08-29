import React from 'react'
import Topbar from '../pages/Topbar'
import Sidebar from '../pages/Sidebar'
import Left from '../pages/Left'
import Right from '../pages/Right'
import OnlineUser from '../pages/OnlineUser'

const Home = () => {
  return (
    <div>
      <Topbar/>
     <div className=' flex flex-row pt-[40px]'>
         <Sidebar/>
          {/* <OnlineUser/>  */}
      <Left/>
      {/* <Right/> */}
     </div>
    </div>
  )
}

export default Home
