import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Topbar from "../../pages/Topbar";
import Sidebar from "../../pages/Sidebar";
import { ImProfile } from "react-icons/im";
import dp from "../../assets/dp.webp";
import { CiSearch, CiClock2, CiHeadphones } from "react-icons/ci";
import { IoFilter, IoMailOutline, IoAddSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { setSingleUser, setUser } from "../../redux/userSlice";
import { LuMessageCircle } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import axios from "axios";
import { AiOutlineAudio } from "react-icons/ai";
import { format, formatDistanceToNow } from "date-fns"; 
import { serverURL } from "../../main";

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { onlineUsers = [] } = useSelector((s) => s.socket) || {};
  const allUsers = useSelector((state) => state.user.allUsers) || [];
  const currentUser = useSelector((state) => state.user.user) || null;
  const singleUser = useSelector((state) => state.user.singleUser) || null;

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("most");
  const [titleFilter, setTitleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editSecond, setEditSecond] = useState(false);
  const [editThird, setEditThird] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    displayName: "",
    title: "",
    email: "",
    location: "",
    namePronunciation: "",
    number: "",
    timezone: "",
    date: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  
  // --- Helper to construct full image URL ---
  const getImageUrl = (path) => {
    if (!path) return dp;
    if (path.startsWith('http') || path.startsWith('blob:')) return path;
    return `${serverURL}/${path.replace(/\\/g, '/')}`; // Ensure forward slashes
  };

  const filtered = useMemo(() => {
    const query = (q || "").trim().toLowerCase();
    return allUsers.filter((u) => {
      if (!u) return false;
      const matchesQuery = !query || (u.name && u.name.toLowerCase().includes(query)) || (u.role && u.role.toLowerCase().includes(query));
      const matchesTitle = !titleFilter || (u.role && u.role.toLowerCase().includes(titleFilter));
      const matchesLocation = !locationFilter || (u.location && u.location.toLowerCase().includes(locationFilter));
      return matchesQuery && matchesTitle && matchesLocation;
    });
  }, [allUsers, q, titleFilter, locationFilter]);

  const clearFilters = () => {
    setTitleFilter("");
    setLocationFilter("");
    setSort("most");
  };

  const openUser = (u) => {
    if (!u) return;
    dispatch(setSingleUser(u));
    const routeVal = u.userName || u._id || (u.name && u.name.toLowerCase().split(" ").join("-")) || null;
    if (routeVal) {
      try {
        window.history.pushState({}, "", `/profile/${encodeURIComponent(routeVal)}`);
      } catch (err) {
        console.warn("Failed to update URL:", err);
      }
    }
  };

  const closeProfilePane = () => {
    dispatch(setSingleUser(null));
    try {
      window.history.pushState({}, "", "/profile");
    } catch (err) { /* ignore */ }
  };

  const visibleUsers = useMemo(() => filtered, [filtered]);
  const gridContainerClass = singleUser ? "mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 px-4" : "mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-4";
  const gridWrapperClass = singleUser ? "mx-auto w-full max-w-[900px]" : "w-full";
  const localTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
  };

  // --- Revised useEffect to populate form correctly ---
  useEffect(() => {
    if ((openEdit || editSecond || editThird) && singleUser) {
      const dateForInput = singleUser.date ? format(new Date(singleUser.date), 'yyyy-MM-dd') : "";
      setForm({
        name: singleUser.name || "",
        displayName: singleUser.displayName || singleUser.name || "",
        title: singleUser.role || "",
        email: singleUser.email || "",
        number: singleUser.number || "",
        location: singleUser.location || "",
        namePronunciation: singleUser.namePronunciation || "",
        timezone: singleUser.timezone || "",
        date: dateForInput,
      });
      setUploadFile(null);
    }
  }, [openEdit, editSecond, editThird, singleUser]);

  const handleFormChange = (key, value) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  // --- Revised handleSaveChanges to include all fields ---
  const handleSaveChanges = async () => {
    if (!singleUser?._id) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('displayName', form.displayName);
      fd.append('role', form.title); 
      fd.append('number', form.number);
      fd.append('location', form.location);
      fd.append('namePronunciation', form.namePronunciation);
      fd.append('email', form.email);
      fd.append('date', form.date);

      if (uploadFile) {
        fd.append("avatar", uploadFile);
      }

      const res = await axios.put(`/api/user/edit/${singleUser._id}`, fd, {
        headers: { ...authHeaders().headers, "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res?.data) {
        dispatch(setSingleUser(res.data));
      }
      
      setOpenEdit(false);
      setEditSecond(false);
      setEditThird(false);
    } catch (err) {
      console.error("Failed to save changes", err);
      alert("Failed to save changes. See console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setOpenEdit(false);
    setEditSecond(false);
    setEditThird(false);
    setUploadFile(null);
  };

  // This variable checks if the user currently shown in the sidebar is online
  const isSingleOnline = singleUser ? (onlineUsers || []).some((id) => String(id) === String(singleUser._id)) : false;

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0"><Topbar /></div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="bg-[#532755] lg:w-[350px] sm:w-[200px] ml-[72px] mt-[48px] pt-[30px] pl-[30px] flex flex-col text-white">
          <p className="text-white">People</p>
          <div className="flex flex-row gap-[10px] pt-[10px] items-center text-white hover:text-[#39063a] hover:bg-[#f9edff] hover:rounded-xl hover:p-[5px]"><ImProfile className="text-white" /><p className="flex">All people</p></div>
          <div className="flex flex-row gap-[10px] pt-[10px] items-center text-white hover:text-[#39063a] hover:bg-[#f9edff] hover:rounded-xl hover:p-[5px]"><ImProfile className="text-white" /><p>User groups</p></div>
        </div>
        
        <main className={`${singleUser ? "hidden" : "block"} md:block flex-1 p-6 mt-[48px] overflow-y-auto bg-[#f8f8f8] transition-all duration-200`}>
          <div className="flex flex-col">
            <div className="flex flex-row justify-between items-center"><p className="font-bold text-2xl">All people</p><button className="rounded-xl font-semibold bg-white p-[5px] border" onClick={() => navigate("/invite")}>Invite people</button></div>
            <div className="bg-white border m-5 rounded-xl flex items-center px-3 h-10 md:w-[90%] shadow-[0_0_5px_5px_rgba(30,64,175,0.06)]"><CiSearch className="text-black text-lg mr-2" /><input type="text" placeholder="Search for people" className="flex-1 rounded-xl outline-none p-2 bg-transparent" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <div className="flex justify-between items-center gap-[8px] px-[5px]">
              <select className="bg-white border border-black w-[160px] p-[6px] h-[35px] rounded" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)}><option value="">Title</option><option value="software">Software Developer</option><option value="ceo">CEO</option><option value="cto">CTO</option><option value="devops">DevOps Engineer</option><option value="full">Full Stack Developer</option></select>
              <select className="bg-white border border-black w-[140px] p-[6px] h-[35px] rounded" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}><option value="">Location</option><option value="remote">Remote</option><option value="india">India</option><option value="us">United States</option><option value="uk">United Kingdom</option></select>
              <button type="button" className="flex items-center gap-2 bg-transparent" onClick={() => setOpenFilter(true)}><IoFilter className="text-xl" /><p className="font-semibold">Filters</p></button>
              <div className="relative ml-auto"><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white border rounded px-3 py-2"><option value="most">Most recommended</option><option value="recent">Recently active</option></select></div>
            </div>
            <div className={gridWrapperClass}>
              <div className={gridContainerClass}>
              {visibleUsers.length === 0 ? <div className="text-gray-500">No people found.</div> : visibleUsers.map((allUsers, i) => {
                  const key = allUsers._id || allUsers.id || i;
                  const isOnline = (onlineUsers || []).some((id) => String(id) === String(allUsers._id));
                  return (
                      <div key={key} className={`relative border shadow-sm h-[340px] hover:shadow-md transition rounded cursor-pointer ${singleUser && (singleUser._id === allUsers._id || singleUser.userName === allUsers.userName) ? "ring-2 ring-indigo-200" : ""}`} onClick={() => openUser(allUsers)}>
                          <div className="flex flex-col items-center text-center">
                              <div className="relative">
                                  <img src={getImageUrl(allUsers.profileImage)} alt={allUsers.name || "User Avatar"} className="w-46 h-58 object-cover mb-3 rounded" />
                              </div>
                              <div className="flex flex-row items-center gap-2">
                                  <h3 className="flex font-semibold text-lg truncate">{allUsers?.name}</h3>
                                  {isOnline ? (<div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span><span className="text-sm text-gray-600">Active</span></div>) : (<div className="flex items-center gap-2 flex-row "><span className="w-1 h-1 rounded-full ring-2 text-gray-600 items-center"></span></div>)}
                              </div>
                              
                              {allUsers.role && (
                                  <p className="text-gray-700 text-xs mt-1 truncate w-full ">{allUsers.role}</p>
                              )}
                              
                              {/* Display status in grid view if available */}
                              {allUsers?.status?.text && (
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <span className="text-sm">{allUsers.status.emoji}</span>
                                    <span className="text-xs text-gray-500 truncate">{allUsers.status.text}</span>
                                </div>
                              )}
                          </div>
                      </div>
                  );
              })}
              </div>
            </div>
          </div>
        </main>
        
        {/* --- RIGHT SIDEBAR PROFILE PANE --- */}
        {singleUser && (
          <aside className="fixed top-[48px] right-0 bottom-0 left-[72px] sm:left-[272px] md:static md:w-[420px] md:border-l transition-all duration-200 h-[calc(100vh-48px)] flex flex-col bg-white" aria-label="Profile pane">
            <div className="sticky top-11 z-10 bg-white border-b px-6 py-4 flex items-center justify-between"><h3 className="text-xl font-semibold">Profile</h3><button onClick={closeProfilePane} className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer" aria-label="Close profile pane">✕</button></div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6">
              <div className="flex flex-col items-start mt-14">
                <div className="w-full flex justify-center mb-4">
                  <div className="relative">
                    <img src={getImageUrl(singleUser.profileImage)} alt="avatar" className="w-56 h-56 rounded-lg object-cover" />
                    {singleUser._id === currentUser?._id && (
                      <label className="absolute top-2 bg-white border  py-1 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                          {singleUser.profileImage ? 'Change' : 'Upload photo'}
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex flex-row items-center justify-start w-full">
                  <h2 className="text-3xl font-bold">{singleUser.name}</h2>
                  {currentUser?._id === singleUser._id && (<div><div className="text-blue-800 cursor-pointer" onClick={() => setOpenEdit(true)}>Edit</div></div>)}
                </div>
                {currentUser?._id === singleUser._id && (<div className="flex items-center gap-[10px] mt-2 text-sm text-blue-700"><IoAddSharp /><span>Add name pronunciation</span></div>)}
                <p className="text-gray-600 mt-3">{singleUser.role}</p>
                
                {/* --- START: CORRECTED STATUS SECTION --- */}
                <div className="flex flex-col gap-2 mt-4">
                    {/* 1. Online/Active Status */}
                    <div className="flex items-center gap-3">
                        {isSingleOnline ? (
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                                <span className="text-gray-700">Active</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 border-2 border-gray-400 rounded-full"></span>
                                <span className="text-gray-700">Away</span>
                            </div>
                        )}
                    </div>

                    {/* 2. Custom Status (Emoji + Text) */}
                    {singleUser?.status?.text && (
                        <div className="flex items-center gap-3">
                            <span className="text-lg w-5 text-center">
                                {singleUser.status.emoji || "💬"}
                            </span>
                            <span className="text-gray-700">
                                {singleUser.status.text}
                            </span>
                        </div>
                    )}
                </div>
                {/* --- END: CORRECTED STATUS SECTION --- */}

                <div className="flex items-center gap-3 text-sm text-gray-500 mt-3"><CiClock2 className="font-bold text-xl text-black" /><span>{localTime} local time</span></div>
                {currentUser?._id === singleUser._id ? (
                  <div className="flex flex-row gap-[10px] items-center mt-4"><div className="px-3 py-2 border rounded">Set a status</div><div className="px-3 py-2 border rounded">View as</div><button className="px-2 py-2 border rounded"><IoMdMore /></button></div>
                ) : (
                  <div className="mt-6 flex gap-2 flex-wrap"><button className="px-2 border rounded flex items-center gap-2"><LuMessageCircle /> Message</button><button className="px-1 border rounded flex items-center gap-2"><CiHeadphones /> Huddle ▾</button><button className="px-3 border rounded flex items-center gap-2"><CgProfile /> VIP</button><button className="px-2 py-2 border rounded flex items-center"><IoMdMore /></button></div>
                )}
                <div className="flex items-center justify-between w-full mt-6">
                  <p className="font-bold">Contact information</p>
                  {currentUser?._id === singleUser._id && (<div className="text-blue-800 cursor-pointer" onClick={() => setEditSecond(true)}>Edit</div>)}
                  {editSecond && singleUser && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4 "><div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden"><div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"><h2 className="text-xl font-bold">Edit Contact information</h2><button onClick={() => setEditSecond(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button></div><div className="flex flex-col p-6 space-y-5 overflow-y-auto"><label className="font-bold text-2xl">Email address</label><input type="text" value={form.email} onChange={(e) => handleFormChange("email", e.target.value)} className="border rounded-xl p-2 hover:bg-[#f8f8f8] " /><label className="font-bold">Phone</label><input type="number" value={form.number} onChange={(e) => handleFormChange("number", e.target.value)} className="border rounded-xl p-2" /></div><div className="flex items-center gap-3 py-5 px-6 justify-end border-t"><button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button><button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></div></div></div>
                  )}
                </div>
                <hr className="w-full my-3" />
                {singleUser?.email && (
                  <div className="flex flex-row items-center gap-[20px]"><div className="bg-blue-200 w-[25px] h-[25px] p-[3px] rounded"><IoMailOutline /></div><div className="flex flex-col"><p className="text-gray-700">Email address</p><p className="text-blue-700">{singleUser.email}</p></div></div>
                )}
                {currentUser?._id === singleUser._id && (
                  <div className="flex flex-row items-center gap-[20px] mt-[15px] border-b w-full pb-4">
                    {singleUser.number ? (
                       <div className="flex flex-col">
                         <p className="text-gray-700">Phone</p>
                         <p className="text-blue-700">{singleUser.number}</p>
                       </div>
                    ) : (
                      <div className="flex flex-col cursor-pointer" onClick={() => setEditSecond(true)}>
                        <div className="flex flex-row text-blue-700 items-center gap-[5px]"><p className="text-2xl">+</p><p className="text-blue-700">Add Phone</p></div>
                      </div>
                    )}
                  </div>
                )}
                
                {currentUser?._id === singleUser._id && (
                  <div className="flex flex-col w-full mt-6">
                    <div className="flex flex-row items-center justify-between w-full"><h2 className="text-2xl font-semibold">About me</h2><div className="text-blue-800 cursor-pointer" onClick={() => setEditThird(true)}>Edit</div></div>
                    {editThird && singleUser && (
                      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4 ">
                        <div className="bg-white w-[600px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
                          <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
                        <h2 className="text-xl font-bold">Edit About Me</h2>
                        <button onClick={() => setEditThird(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button>
                        </div>
                      <div className="flex flex-col p-6 space-y-5 overflow-y-auto">
                          <label className="font-bold text-2xl">Start Date</label>
                          <input type="Date" value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} className="border rounded-xl p-2 hover:bg-[#f8f8f8] " />
                      </div>
                      <div className="flex items-center gap-3 py-5 px-6 justify-end border-t"><button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button><button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></div></div></div>
                    )}
                    {singleUser.date ? (
                        <div className="mt-4">
                           <p className="text-gray-700">Start Date</p>
                           <p className="text-blue-700">{format(new Date(singleUser.date), 'MMM d, yyyy')} <span className="text-blue-700">({formatDistanceToNow(new Date(singleUser.date))} ago)</span></p>
                        </div>
                    ) : (
                       <div className="flex flex-row text-blue-700 items-center gap-[5px] mt-4 cursor-pointer" onClick={() => setEditThird(true)}><p className="text-2xl">+</p><p className="text-blue-700">Add Start Date</p></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {openEdit && singleUser && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 px-4">
          <div className="bg-white w-full max-w-[900px] rounded-lg shadow-lg flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"><h2 className="text-xl font-bold">Edit your profile</h2><button onClick={() => setOpenEdit(false)} className="text-xl text-gray-600" aria-label="Close edit modal"><RxCross2 /></button></div>
            <div className="overflow-auto overflow-x-hidden">
              <div className="flex-1 px-6 py-6 flex gap-6 min-h-0">
                <div className="flex-1 pr-4 min-h-0">
                  <div className="mb-4"><label className="block text-sm font-medium">Full name</label><input type="text" className="w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-300" value={form.name} onChange={(e) => handleFormChange("name", e.target.value)} /></div>
                  <div className="mb-4"><label className="block text-sm font-medium">Display name</label><input type="text" className="w-full border rounded px-3 py-2 mt-1" value={form.displayName} onChange={(e) => handleFormChange("displayName", e.target.value)} /><p className="text-xs text-gray-500 mt-1">This could be your first name or a nickname — the name you'd like people to use to refer to you.</p></div>
                  <div className="mb-4"><label className=" text-sm font-bold">Title</label><input type="text" className="w-full border rounded px-3 py-2 mt-1" value={form.title} onChange={(e) => handleFormChange("title", e.target.value)} placeholder="Title" /></div>
                  <div className="mb-4"><label className="block text-sm font-bold">Name recording</label><div className="flex items-center gap-3 mt-2"><button className="px-3 py-2 border rounded flex items-center gap-2"><AiOutlineAudio className="font-bold" /><span className="font-bold">Record audio clip</span></button></div></div>
                </div>
                <div className="w-64 flex-shrink-0">
                  <p className="font-bold ml-[40px]">Profile photo</p>
                  <div className=" rounded-lg p-4 flex flex-col items-center gap-4">
                    <div className="w-36 h-36 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                      <img src={uploadFile ? URL.createObjectURL(uploadFile) : getImageUrl(singleUser.profileImage)} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <label className="w-full">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      <div className="text-center font-bold border rounded-xl w-[180px] ml-8 py-2 cursor-pointer">Upload photo</div>
                    <p className="text-blue-700 text-xl ml-[54px] mt-[13px]">Remove photo</p></label>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex gap-4 flex-col">
                <div className=""><label className="block text-sm font-bold">Name pronunciation</label><input type="text" className="w-full border rounded px-3 py-2 mt-1" value={form.namePronunciation} onChange={(e) => handleFormChange("namePronunciation", e.target.value)} placeholder="Emily (pronounced 'em-i-lee')" /><p className="text-gray-700 text-sm mt-1">This could be a phonetic pronunciation, or an example of something that your name sounds like.</p></div>
                <div className=""><label className="block font-bold text-black ">Time zone</label><input type="text" className="w-full border rounded px-3 py-2 mt-1" value={form.timezone} onChange={(e) => handleFormChange("timezone", e.target.value)} placeholder="(UTC-07:00) Arizona" /><p className="text-gray-700 text-sm mt-1">Your current time zone. Used to send summary and notification emails, for times in your activity feeds and for reminders.</p></div>
                <div className="flex items-center gap-3 justify-end"><button type="button" onClick={handleCancel} className="px-4 py-2 border rounded" disabled={saving}>Cancel</button><button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {openFilter && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button className="absolute top-4 right-4 text-xl text-gray-600" onClick={() => setOpenFilter(false)}><RxCross2 /></button>
            <h2 className="text-xl font-bold mb-4">Filter by</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><select className="w-full border rounded px-3 py-2" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)}><option value="">Any title</option><option value="software">Software Developer</option><option value="ceo">CEO</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Location</label><select className="w-full border rounded px-3 py-2" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}><option value="">Any location</option><option value="remote">Remote</option><option value="india">India</option></select></div>
              <div className="flex items-center justify-between mt-4"><a className="text-sm text-blue-600">Learn more about search</a><div className="flex gap-3"><button onClick={clearFilters} className="px-4 py-2 border rounded">Clear filters</button><button onClick={() => setOpenFilter(false)} className="px-4 py-2 bg-green-600 text-white rounded">Search</button></div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;