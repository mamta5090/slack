// import React from "react";
// import { Outlet } from "react-router-dom";
// import Topbar from "../pages/Topbar";
// import Sidebar from "../pages/Sidebar";

// const MainLayout = () => {
//   return (
//     <div className="w-full h-screen flex flex-col overflow-hidden">
//       {/* Topbar is always present */}
//       <Topbar />
//       <div className="flex flex-1 overflow-hidden">
//         {/* The thin icon Sidebar is always present */}
//         <Sidebar />
        
//         {/* The Outlet is a flexible placeholder. The router will fill this space. 
//             The extra div ensures the content starts after the thin sidebar. */}
//         <div className="flex-1 h-full">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MainLayout;