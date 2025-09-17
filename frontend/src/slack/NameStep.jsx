// src/pages/NameStep.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiHome4Fill } from "react-icons/ri";
import { CiSaveDown2 } from "react-icons/ci";

const NameStep = () => {
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
    
    console.log("Next clicked", { name, photoFile });
    navigate("/company");
  };

  // compute avatar bg class based on presence of name
  const avatarBgClass = name.trim() ? "bg-[#724875]" : "bg-[#1f1a2a]";

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#0b0b0b]">
      <div className="flex-shrink-0 bg-[#481349] w-full h-[56px]" />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT NAV (narrow column) */}
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

        {/* LEFT WIDER COLUMN (where we put the name input at the top for md+) */}
        <div className="hidden md:flex bg-gradient-to-b from-[#3d0d3e] to-[#4f1147] w-[340px] flex-col px-4 pt-3">
          {/* Move the editable name input to the top of this left box */}
         
          <input
            id="sidebar-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={maxLength}
            className="w-full bg-transparent text-white font-semibold pt-[10px] pb-2 placeholder:text-gray-300 focus:outline-none"
            aria-label="Workspace name (sidebar)"
          />

         

          {/* keep file input hidden (for choose photo button in narrow nav) */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-grow overflow-auto bg-white flex  justify-center">
          <div className="w-full h-full  px-10 py-10 ">
            <div className="text-sm text-gray-400 mb-6">Step 1 of 4</div>

            <h1 className="text-5xl font-semibold mb-4 leading-tight">
              What’s the name of your
              <br />
              company or team?
            </h1>

            <p className="text-gray-700 mb-8 max-w-2xl">
              This will be the name of your Slack workspace — choose something that your team will recognize.
            </p>

            <div className="mb-8">
              <div className="relative">
                <label htmlFor="main-name-input" className="sr-only">
                  Workspace name
                </label>
                <input
                  id="main-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={maxLength}
                  placeholder="Ex: Acme Marketing or Acme Co"
                  className="w-full border rounded-lg px-4 py-3 text-black text-lg focus:outline-none focus:ring-4 focus:ring-[#2ea7e0] transition"
                />

                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 px-2 rounded">
                  {name.length}/{maxLength}
                </div>
              </div>
            </div>

            {/* Photo preview (if chosen) */}
            {photoPreview && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Selected photo</div>
                <img src={photoPreview} alt="preview" className="w-32 h-32 object-cover rounded-md border" />
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={handleNext}
                disabled={!name.trim()}
                className={`px-6 py-3 rounded-md font-semibold text-white ${
                  name.trim()
                    ? "bg-[#6f2b72] hover:bg-[#5e265f]"
                    : "bg-gray-500 text-gray-400 cursor-not-allowed"
                }`}
                aria-disabled={!name.trim()}
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

export default NameStep;
