import React from 'react'
import { Routes, Route } from 'react-router-dom'   
import Registration from './component/Registration'
import Login from './component/Login'
import Home from './component/Home'
import Right from './pages/Right'
 

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Registration />} />
      <Route path='/login' element={<Login />} />
      <Route path='/home' element={<Home/>}/>
       <Route path="/user/:id" element={<Home />} />
    </Routes>
  )
}

export default App
