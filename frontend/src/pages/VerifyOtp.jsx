// // src/pages/VerifyOtp.jsx
// import React, { useState } from "react";
// import axios from "axios";
// import { useDispatch } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import { setSlackUser } from "../redux/slackUserSlice";
// import { serverURL } from "../main.jsx";

// const VerifyOtp = () => {
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const email = location.state?.email;

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();

//     if (!otp) {
//       setError("Please enter OTP");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const res = await axios.post(`${serverURL}/api/slack/verifyotp`, {
//         email,
//         otp,
//       });

//       console.log("VerifyOtp response:", res.data);

//       const token = res.data.token;
//       const user = res.data.user;

//       if (token) {
//         localStorage.setItem("token", token);
//         axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       }

//       dispatch(setSlackUser(user));

//       // go to NameStep / Home
//       navigate("/");

//     } catch (error) {
//       console.error(error);
//       setError(error.response?.data?.message || "OTP verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-white px-4 relative">
//       <main className="flex-grow flex flex-col items-center justify-center py-8">
//         <div className="flex flex-row items-center gap-2 mb-6">
//           <img
//             src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
//             alt="Slack logo"
//             className="w-8 h-8"
//           />
//           <p className="font-bold text-2xl">Slack</p>
//         </div>

//         <h1 className="text-4xl font-bold text-gray-900 text-center">
//           Enter OTP
//         </h1>

//         <p className="text-gray-600 mt-2 mb-6">
//           We’ve sent a verification code to <b>{email}</b>
//         </p>

//         <form
//           onSubmit={handleVerifyOtp}
//           className="w-full max-w-md mt-5 flex flex-col items-center"
//         >
//           <input
//             type="text"
//             placeholder="Enter OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             className="w-full h-[45px] px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-700"
//           />

//           {error && (
//             <p className="text-red-600 text-sm mt-2">{error}</p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full h-[45px] mt-5 rounded-md text-white font-medium ${
//               loading ? "bg-purple-300" : "bg-[#703578]"
//             }`}
//           >
//             {loading ? "Verifying..." : "Verify OTP"}
//           </button>
//         </form>
//       </main>

//       <footer className="flex justify-center gap-6 py-4 text-gray-500 text-sm">
//         <p className="cursor-pointer">Privacy & terms</p>
//         <p className="cursor-pointer">Contact us</p>
//         <p className="cursor-pointer">Change region</p>
//       </footer>
//     </div>
//   );
// };

// export default VerifyOtp;
