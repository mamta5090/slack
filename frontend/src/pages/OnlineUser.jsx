import React from 'react'
import { useSelector } from 'react-redux'
import {setSingleUser} from '../redux/userSlice'
const OnlineUser = ({singleUser}) => {
    //const singleUser=useSelector((state)=>state.user.singleUser)
  return (
    <div>
       <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-purple-600 text-lg font-bold">
            {singleUser.name.charAt(0).toUpperCase()}
          </div>
    </div>
  )
}

export default OnlineUser
