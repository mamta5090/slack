import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";
import { CiSaveDown2 } from "react-icons/ci";
import googlelogo from "../assets/googlelogo.webp";
import { LuLink } from "react-icons/lu";

const Team = () => {
  const navigate = useNavigate();

  // separate states
  const [workspaceName, setWorkspaceName] = useState("");
  const [emails, setEmails] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const maxLength = 80;

  const onChoosePhoto = () => fileInputRef.current?.click();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNext = () => {
    console.log("Next clicked", { workspaceName, emails, photoFile });
    navigate("/slackpro");
  };

  const avatarBgClass = workspaceName.trim()
    ? "bg-[#724875]"
    : "bg-[#1f1a2a]";

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#0b0b0b]">
      <div className="flex-shrink-0 bg-[#481349] w-full h-[56px]" />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR */}
       <div className="hidden md:flex bg-[#2b0f2b] w-[72px] h-full flex-col py-[20px] items-center">
               {/* Avatar + small photo controls */}
               <div className={`w-10 h-10 rounded-full text-white border border-[#2f1030] p-2 px-4 font-bold flex items-center justify-center cursor-pointer ${avatarBgClass}`}>
                 { name.charAt(0).toUpperCase()}
               </div>
     
               {/* small choose/remove photo icons (visible on md+) */}
               <div className="mt-2 flex flex-col items-center gap-2">
                 <button
                   type="button"
                   onClick={onChoosePhoto}
                   className="text-xs text-gray-300 hover:text-white"
                   aria-label="Choose workspace photo"
                 >
                 </button>
                
               </div>
     
               {/* icons column */}
               <div className="flex flex-col py-[30px] mt-6">
                 <button
                   type="button"
                   className="flex items-center my-[10px] justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
                   onClick={() => navigate("/home")}
                   aria-label="Home"
                 >
                   <RiHome4Fill className="text-2xl" />
                   <span className="text-xs mt-1">Home</span>
                 </button>
     
                 <button
                   type="button"
                   className="flex items-center justify-center h-14 w-14 rounded-xl hover:bg-gray-700 text-white transition flex-col"
                   onClick={() => navigate("/saved")}
                   aria-label="Saved items"
                 >
                   <CiSaveDown2 className="text-2xl" />
                   <span className="text-xs mt-1">Later</span>
                 </button>
               </div>
             </div>

        {/* RIGHT SIDEBAR */}
        <div className="hidden md:flex bg-gradient-to-b from-[#3d0d3e] to-[#4f1147] w-[340px] flex-col px-4 pt-3">
          <input
            id="sidebar-name-input"
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            maxLength={maxLength}
            className="w-full bg-transparent text-white font-semibold pt-[10px] pb-2 placeholder:text-gray-300 focus:outline-none"
            aria-label="Workspace name (sidebar)"
          />

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-grow overflow-auto bg-white flex justify-center">
          <div className="w-full h-full px-10 py-10">
            <div className="text-sm text-gray-400 mb-6">Step 1 of 4</div>

            <h1 className="text-5xl font-bold mb-4 leading-tight">
              What’s the name of your
              <br />
              company or team?
            </h1>

            <div className="flex flex-row gap-[230px]">
              <p className="mb-4 max-w-2xl font-semibold">
                Add coworker by email
              </p>
              <div className="flex justify-end gap-[10px]">
                <img src={googlelogo} className="w-6 h-6 justify-end" />
                <p className="text-blue-700">Add from Google Contact</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="relative">
                <label htmlFor="main-email-input" className="sr-only">
                  Coworker emails
                </label>
                <input
                  id="main-email-input"
                  type="text"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="Ex: ellis@gmail.com, maria@gmail.com"
                  className="w-[60%] h-[170px] border rounded-lg text-black text-lg focus:outline-none focus:ring-4 focus:ring-[#2ea7e0] transition"
                />
              </div>
            </div>

            <p className="text-black">
              Keep in mind that invitations expire in 30 days, You can extend
              that deadline.
            </p>

            <div className="mt-6 flex flex-row gap-[15px]">
              <button
                onClick={handleNext}
                disabled={!workspaceName.trim()}
                className={`px-10 py-2 rounded-md font-semibold text-white ${
                  workspaceName.trim()
                    ? "bg-[#6f2b72] hover:bg-[#5e265f]"
                    : "bg-gray-500 text-gray-400 cursor-not-allowed"
                }`}
                aria-disabled={!workspaceName.trim()}
              >
                Next
              </button>

              <button
                type="button"
                className="border border-1 rounded-xl px-[10px] flex flex-row items-center gap-2"
              >
                <LuLink /> Copy Invite Link
              </button>

              <div
                onClick={() => navigate("/slackpro")}
                className="flex items-center cursor-pointer"
              >
                Skip this step
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
