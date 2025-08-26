import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";   
import { useSelector } from "react-redux";
import Registration from "./component/Registration";
import Login from "./component/Login";
import Home from "./component/Home";
import Right from "./pages/Right";

const App = () => {

  const { user } = useSelector((state) => state.user);

  return (
    <Routes>
     
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/login" replace />}
      />

     
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/" replace />}
      />

     
      <Route
        path="/register"
        element={!user ? <Registration /> : <Navigate to="/" replace />}
      />

  
      <Route
        path="/user/:id"
        element={user ? <Right /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
