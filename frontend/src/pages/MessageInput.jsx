// import React, { useState, useRef } from "react";
// import EmojiPicker from 'emoji-picker-react';
// import { FiBold, FiItalic } from "react-icons/fi";
// import { FaStrikethrough, FaListUl, FaCode } from "react-icons/fa6";
// import { GoLink, GoQuote } from "react-icons/go";
// import { AiOutlineOrderedList } from "react-icons/ai";
// import { RiCodeBlock, RiArrowDropDownLine } from "react-icons/ri";
// import { BsEmojiSmile, BsPlusLg } from "react-icons/bs";
// import { IoSend, IoAddSharp } from "react-icons/io5";
// import { MdKeyboardArrowDown } from "react-icons/md";
// import { RxCross2 } from "react-icons/rx";
// import useClickOutside from "../hook/useClickOutside";

// const MessageInput = ({ 
//     value, 
//     onChange, 
//     onSend, 
//     placeholder, 
//     loading,
//     onFileSelect,
//     filePreview,
//     onCancelFile,
//     fileType // 'image' or 'video'
// }) => {
//     const [showPicker, setShowPicker] = useState(false);
//     const [plusOpen, setPlusOpen] = useState(false);
//       const [frontendImage, setFrontendImage] = useState(null);
//   const [backendImage, setBackendImage] = useState(null);

//     const fileInputRef = useRef(null);
//     const imageRef = useRef(null);
//     const plusMenuRef = useRef(null);

//   useClickOutside(plusMenuRef, () => setPlusOpen(false));

//   const onEmojiClick = (emojiData) => {
//     setNewMsg(prev => prev + emojiData.emoji);
//     setShowPicker(false);
//   };


//     const handleKeyDown = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) {
//             e.preventDefault();
//             onSend();
//         }
//     };

//       const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             onFileSelect(file);
//             setPlusOpen(false);
//         }
//     };

//       const handleImage = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setBackendImage(file);
//       setFrontendImage(URL.createObjectURL(file));
//     }
//   };
// const cancelImage = () => {
//     setBackendImage(null);
//     setFrontendImage(null);
//     if (imageRef.current) {
//       imageRef.current.value = "";
//     }
//   };


//     return (
//         <div className="relative border border-gray-300 rounded-lg overflow-hidden flex flex-col bg-white">
//             {/* Toolbar */}
//             <div className="flex flex-row items-center gap-5 bg-gray-100 px-3 py-2 border-b">
//                 <FiBold className="cursor-pointer text-gray-600 hover:text-black" />
//                 <FiItalic className="cursor-pointer text-gray-600 hover:text-black" />
//                 <FaStrikethrough className="cursor-pointer text-gray-600 hover:text-black" />
//                 <GoLink className="cursor-pointer text-gray-600 hover:text-black" />
//                 <AiOutlineOrderedList className="cursor-pointer text-gray-600 hover:text-black" />
//                 <FaListUl className="cursor-pointer text-gray-600 hover:text-black" />
//                 <GoQuote className="cursor-pointer text-gray-600 hover:text-black" />
//                 <FaCode className="cursor-pointer text-gray-600 hover:text-black" />
//                 <RiCodeBlock className="cursor-pointer text-gray-600 hover:text-black" />
//             </div>

//             {/* File Preview Area */}
//             {filePreview && (
//                 <div className="p-3 bg-white border-b relative group w-fit">
//                     {fileType?.startsWith('video') ? (
//                         <video src={filePreview} className="h-32 rounded-lg border" controls />
//                     ) : (
//                         <img src={filePreview} className="h-32 w-32 object-cover rounded-lg border" alt="preview" />
//                     )}
//                     <button 
//                         onClick={onCancelFile}
//                         className="absolute -top-1 -right-1 bg-black text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
//                     >
//                         <RxCross2 size={14} />
//                     </button>
//                 </div>
//             )}

//             {/* Textarea */}
//             <textarea
//                 value={value}
//                 onChange={(e) => onChange(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder={placeholder}
//                 className="w-full p-3 min-h-[80px] outline-none resize-none text-[15px]"
//                 disabled={loading}
//             />


//  {frontendImage && (
//         <div className="p-2">
//           <div className="relative w-20 h-20">
//             <div className="group relative h-full w-full">
//               <img
//                 src={frontendImage}
//                 alt="Preview"
//                 className="h-full w-full rounded-md object-cover"
//               />
//               <button
//                 onClick={cancelImage}
//                 className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
//                 aria-label="Remove image"
//               >
//                 <RxCross2 size={14} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//             {/* Bottom Actions */}
//             <div className="flex items-center justify-between px-3 py-2 bg-gray-50 relative">
//         <div className="flex items-center gap-3 text-gray-600">
//           <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Attach file" onClick={() => setPlusOpen(prev => !prev)}>
//             <IoAddSharp />
//           </button>
//           <button type="button" className="text-xl p-1 rounded hover:bg-gray-200" title="Emoji" onClick={() => setShowPicker(prev => !prev)}>
//             <BsEmojiSmile />
//           </button>
//         </div>

//                 {/* Plus Menu (Uploads) */}
//                 {plusOpen && (
//           <div ref={plusMenuRef} className="absolute bottom-full mb-2 bg-white shadow-lg rounded-md border p-2">
//             <div onClick={() => imageRef.current.click()} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
//               Upload from your computer
//               <input type="file" hidden accept="image/*" ref={imageRef} onChange={handleImage} />
//             </div>
//           </div>
//         )}
//                 {/* Emoji Picker */}
//                 {showPicker && (
//       <div className='absolute bottom-[80px] left-[260px] lg:left-[460px] shadow z-10'>
//         <EmojiPicker width={350} height={450} className="shadow-lg" onEmojiClick={onEmojiClick} />
//       </div>
//     )}

//                 <div className="flex items-center gap-2">
//                     <button 
//                         onClick={onSend}
//                         disabled={loading || (!value.trim() && !filePreview)}
//                         className={`p-1.5 rounded ${value.trim() || filePreview ? 'bg-[#007a5a] text-white' : 'text-gray-300'}`}
//                     >
//                         <IoSend size={20}/>
//                     </button>
//                     <div className="h-5 w-px bg-gray-300" />
//                     <button type="button" className="p-1 rounded hover:bg-gray-200 text-gray-600">
//                         <MdKeyboardArrowDown className="text-2xl" />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MessageInput;