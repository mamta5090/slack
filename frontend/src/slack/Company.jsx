// src/pages/NameStep.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";

import { CiSaveDown2 } from "react-icons/ci";

const Company = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
    // TODO: save name/photo to backend or redux
    console.log("Next clicked", { name, photoFile });
    navigate("/team");
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#0b0b0b]">

      <div className=" flex-shrink-0 bg-[#481349] w-full h-[56px]" />

      <div className=" flex flex-1 overflow-hidden">
      
        <div className="hidden md:flex bg-[#2b0f2b] w-[72px] h-full flex-col py-[20px]  items-center ">

          <div className="w-10 h-10  rounded-full bg-[#1f1a2a] text-white border border-[#2f1030] p-2 px-4 font-bold" >
            {name.charAt(0).toUpperCase()}
          </div>

<div className="flex flex-col py-[30px]">
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

       
        <div className="hidden md:flex bg-gradient-to-b from-[#3d0d3e] to-[#4f1147] w-[340px] items-center px-4 pt-3">
  <input
    type="text"
    value={name}
    className="w-full bg-transparent  text-white font-semibold  pt-[10px]"
  
  />
</div>


     
        <div className="flex-grow overflow-auto  flex items-start justify-center">
          <div className="w-full h-full  bg-white p-10 shadow-lg">
            <div className="text-sm text-gray-400 mb-6">Step 1 of 4</div>

            <h1 className="text-5xl font-semibold mb-4 leading-tight">
              What’s ypur name?
            </h1>

            <p className="text-gray-700 mb-8 max-w-2xl">
Adding ypur name and profile photo helps ypur teammates to recognise and connect with you more easily.
            </p>

          
            <div className="mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={maxLength}
                  placeholder="Your full name"
                  className="w-full border  rounded-lg px-4 py-3 text-black text-lg focus:outline-none focus:ring-4 focus:ring-[#2ea7e0] transition"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 bg-[#0b1220] px-2 rounded">
                  {name.length}
                </div>
              </div>
            </div>

          
            <div className="mb-8">
              <div className=" font-medium mb-2">
                Your profile photo <span className="text-gray-400 font-normal">(optional)</span>
              </div>
              <div className="text-gray-400 mb-4">
                Help your teammates to know that they’re talking to the right person.
              </div>

              <div className="flex items-start gap-6">
                <div className="w-28 h-28 rounded-md bg-green-600 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zM12 14.4c-4 0-7.2 2.1-7.2 4.8v1.2h14.4v-1.2c0-2.7-3.2-4.8-7.2-4.8z" />
                    </svg>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <button
                      onClick={onChoosePhoto}
                      className="px-4 py-2 bg-gray-500 border border-[#2b3740] rounded-md text-sm text-white hover:bg-[#111827]"
                    >
                      Upload photo
                    </button>

                    {photoPreview && (
                      <button
                        onClick={removePhoto}
                        className="px-4 py-2 bg-transparent border border-[#2b3740] rounded-md text-sm text-gray-300 hover:bg-[#111827]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">Help your teammates to know that they're talking to the right person.</div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </div>

            {/* Next */}
            <div className="mt-6">
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className={`px-6 py-3 rounded-md font-semibold text-white ${
                  name.trim()
                    ? "bg-[#6f2b72] hover:bg-[#5e265f]"
                    : "bg-gray-500 text-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Company;
