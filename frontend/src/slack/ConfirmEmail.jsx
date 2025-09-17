import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { setSlackUser } from "../redux/slackUserSlice";
import mail from "../assets/mail.png";
import outlook from "../assets/outlook.png";

const ConfirmEmail = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const slackUser = useSelector((state) => state.slackUser.slackUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Auto-send OTP when page loads
  useEffect(() => {
    const sendOtp = async () => {
      try {
        const result = await axios.post("http://localhost:5000/api/slack/sendotp", {
          email: slackUser?.email,
        });
        console.log("OTP sent to:", slackUser?.email);
        console.log("OTP API response:", result.data);
      } catch (error) {
        console.error("Error auto-sending OTP:", error);
      }
    };

    if (slackUser?.email) {
      sendOtp();
    }
  }, [slackUser?.email]);

  const handleChange = async (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to next box
      if (index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }

      // ✅ When OTP fully entered (6 digits), auto-verify
      if (newOtp.join("").length === 6) {
        await handleVerify(newOtp.join(""));
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);

        if (index > 0) {
          document.getElementById(`otp-${index - 1}`).focus();
        }
      }
    }
  };

  // ✅ Auto verification logic
  const handleVerify = async (code) => {
    try {
      const result = await axios.post("http://localhost:5000/api/slack/verifyotp", {
        email: slackUser?.email,
        otp: code,
      });

      console.log("OTP API response:", result.data);

      if (result.data.success) {
        dispatch(setSlackUser(result.data.user));
        console.log("OTP verified successfully");
        navigate("/launchworkspace");
      } else {
        console.error("OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white text-center px-4">
      <div className="flex flex-col items-center justify-center flex-grow">
        {/* Slack logo */}
        <div className="flex flex-row items-center gap-2 mb-6">
          <img
            src="https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png"
            alt="Slack"
            className="w-8 h-8"
          />
          <p className="font-bold text-2xl">Slack</p>
        </div>

        <h1 className="text-5xl font-bold mb-2">We emailed you a code</h1>
        <p className="text-gray-900 mb-6">
          We sent an email to{" "}
          <span className="font-bold">
            {slackUser?.email || "youremail@gmail.com"}
          </span>
          . Enter the code here or tap the button <br /> in the email to continue.
        </p>

        <p className="py-3">
          If you don't see the email, check your spam or junk folder.
        </p>

        {/* OTP Inputs */}
        <div className="flex space-x-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 border border-gray-400 rounded-md text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
        </div>

        {/* Remove Verify Button ✅ */}

        {/* Open Gmail / Outlook */}
        <div className="flex flex-row space-x-4 mb-6">
          <button className="text-blue-600 flex items-center gap-2 hover:underline">
            <img src={mail} className="w-[30px]" alt="Gmail" /> Open Gmail
          </button>
          <button className="text-blue-600 flex items-center gap-2 hover:underline">
            <img src={outlook} className="w-[30px]" alt="Outlook" /> Open Outlook
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Can’t find your code?{" "}
          <button className="text-blue-600 hover:underline">Request a new code</button>
        </p>
        <p className="text-sm text-gray-600">
          Having trouble?{" "}
          <button className="text-blue-600 hover:underline">
            Try entering a workspace URL
          </button>
        </p>
      </div>

      <footer className="flex justify-center gap-6 py-4 text-gray-500 text-sm">
        <p className="cursor-pointer">Privacy & terms</p>
        <p className="cursor-pointer">Contact us</p>
      </footer>
    </div>
  );
};

export default ConfirmEmail;
