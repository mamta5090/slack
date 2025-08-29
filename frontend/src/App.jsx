import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import io from "socket.io-client";
import { setSocket, setOnlineUsers, clearSocket } from "./redux/SocketSlice";

import Registration from "./component/Registration";
import Login from "./component/Login";
import Home from "./component/Home";
import Right from "./pages/Right";

const SERVER_URL = "http://localhost:5000";

const App = () => {
  const user = useSelector((state) => state.user.user);
  const socket = useSelector((state) => state.socket.socket); // ✅ fix: from socketSlice
  const dispatch = useDispatch();
  //const socketRef = useRef(null);

  useEffect(() => {
    if (user) {
      const socketIo = io(SERVER_URL, {
        query: {
          userId: user._id,
        },
      });

      dispatch(setSocket(socketIo));

      // ✅ move online users listener inside connection
      socketIo.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });

      return () => {
        socketIo.close(); // ✅ close the socket we just created
        dispatch(clearSocket()); // also clear from redux
      };
    } else {
      if (socket) {
        socket.close();
        dispatch(clearSocket());
      }
    }
  }, [user, dispatch]);

  // useEffect(() => {
  //   if (user && !socketRef.current) {
  //
  //     socketRef.current = io(SERVER_URL, {
  //       auth: { userId: user._id },
  //       transports: ["websocket"],
  //       withCredentials: true,
  //     });
  //
  //     dispatch(setSocket(socketRef.current));
  //
  //     socketRef.current.on("getOnlineUser", (users) => {
  //       dispatch(setOnlineUser(users || []));
  //     });
  //   }
  //
  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.off("getOnlineUser");
  //       socketRef.current.disconnect();
  //       socketRef.current = null;
  //     }
  //     dispatch(clearSocket());
  //     dispatch(setOnlineUser([]));
  //   };
  // }, [user, dispatch]);

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
      <Route
        path="/msg"
        element={user ? <Right /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
