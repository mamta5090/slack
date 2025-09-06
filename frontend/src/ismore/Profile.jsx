// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import Topbar from "../pages/Topbar";
import Sidebar from "../pages/Sidebar";
import dp from "../assets/dp.webp";
import { ImProfile } from "react-icons/im";
import { CiSearch, CiClock2, CiHeadphones } from "react-icons/ci";
import { IoIosArrowBack, IoMdMore } from "react-icons/io";
import { LuMessageCircle } from "react-icons/lu";
import { IoFilter } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { CgProfile } from "react-icons/cg";
import { IoMailOutline } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

const Profile = () => {
  const { onlineUsers } = useSelector((s) => s.socket || {});
  const navigate = useNavigate();
  const { userName } = useParams(); // optional route param
  const allUsers = useSelector((state) => state.user.allUsers) || [];
  const currentUser = useSelector((state) => state.user.user) || null;

  // selectedUser logic
  const selectedFromParams = useMemo(() => {
    if (!userName) return null;
    return allUsers.find(
      (u) =>
        u?.userName === userName ||
        u?.username === userName ||
        u?.name?.toLowerCase().split(" ").join("-") === userName ||
        u?._id === userName
    );
  }, [allUsers, userName]);

  const [selectedUser, setSelectedUser] = useState(selectedFromParams || currentUser || null);

  useEffect(() => {
    if (selectedFromParams) setSelectedUser(selectedFromParams);
    else if (!userName && currentUser) setSelectedUser(currentUser);
  }, [selectedFromParams, userName, currentUser]);

  // search + filters state
  const [q, setQ] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sort, setSort] = useState("most");
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    const query = (q || "").trim().toLowerCase();
    return allUsers.filter((u) => {
      if (!u) return false;
      const matchesQuery =
        !query ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.role && u.role.toLowerCase().includes(query));
      const matchesTitle = !titleFilter || (u.role && u.role.toLowerCase().includes(titleFilter));
      const matchesLocation = !locationFilter || (u.location && u.location.toLowerCase().includes(locationFilter));
      return matchesQuery && matchesTitle && matchesLocation;
    });
  }, [allUsers, q, titleFilter, locationFilter]);

  // open profile card (navigate and set selected)
  const openUser = (u) => {
    const routeVal = u.userName || u.username || u._id || (u.name && u.name.toLowerCase().split(" ").join("-"));
    if (routeVal) navigate(`/profile/${routeVal}`, { replace: false });
    setSelectedUser(u);
  };

  const clearFilters = () => {
    setTitleFilter("");
    setLocationFilter("");
    setSort("most");
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <Topbar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>

        {/* left purple mini column */}
        <aside className="bg-[#532755] w-[300px] ml-[72px] mt-[48px] pt-[30px] pl-[30px] flex flex-col text-white">
          <p className="text-white text-lg font-semibold">People</p>

          <div className="flex items-center gap-3 mt-4 hover:bg-[#f9edff] hover:text-[#39063a] rounded-xl p-2 cursor-pointer">
            <ImProfile className="text-xl" />
            <span>All people</span>
          </div>

          <div className="flex items-center gap-3 mt-2 hover:bg-[#f9edff] hover:text-[#39063a] rounded-xl p-2 cursor-pointer">
            <ImProfile className="text-xl" />
            <span>User groups</span>
          </div>
        </aside>

        {/* center */}
        <main className="flex-1 p-6 mt-[48px] overflow-y-auto bg-[#f8f8f8]">
          {/* header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">All people</h2>
            <div className="flex items-center gap-3">
              <button className="bg-white border rounded-xl px-4 py-2">Invite people</button>
            </div>
          </div>

          {/* search bar */}
          <div className="bg-white border rounded-xl flex items-center px-3 h-10 md:w-[90%] shadow-[0_0_5px_5px_rgba(30,64,175,0.06)] mb-4">
            <CiSearch className="text-black text-lg mr-2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for people"
              className="flex-1 rounded-xl outline-none p-2 bg-transparent"
            />
          </div>

          {/* controls row: title/location/filters (left), sort (right) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 mb-4">
            {/* left group */}
            <div className="flex items-start sm:items-center gap-3 flex-wrap">
              <select
                className="bg-white border border-black w-[160px] p-[6px] h-[35px] rounded"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              >
                <option value="">Title</option>
                <option value="software">Software Developer</option>
                <option value="ceo">CEO</option>
                <option value="cto">CTO</option>
                <option value="devops">DevOps Engineer</option>
                <option value="full">Full Stack Developer</option>
              </select>

              <select
                className="bg-white border border-black w-[140px] p-[6px] h-[35px] rounded"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">Location</option>
                <option value="remote">Remote</option>
                <option value="india">India</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
              </select>

              <button
                type="button"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => setFilterOpen(true)}
              >
                <IoFilter className="text-xl" />
                <p className="font-semibold">Filters</p>
              </button>
            </div>

            {/* right: sort */}
            <div className="sm:ml-auto mt-2 sm:mt-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border rounded px-3 py-2"
              >
                <option value="most">Most recommended</option>
                <option value="recent">Recently active</option>
              </select>
            </div>
          </div>

          {/* people grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 ">
            {filteredUsers.map((u, idx) => (
              <div
                key={u._id || u.id || idx}
                onClick={() => openUser(u)}
                className={`relative bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition cursor-pointer ${
                  selectedUser && (selectedUser._id === u._id || selectedUser.userName === u.userName)
                    ? "ring-2 ring-indigo-200"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <img src={u.avatar || dp} alt={u.name || "Avatar"} className="w-28 h-28 rounded-full object-cover mb-3" />
                    {u.isOnline && <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />}
                  </div>

                  <h3 className="font-semibold text-lg">{u.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{u.role || "—"}</p>
                  <p className="text-gray-400 text-xs mt-2">{u.location || ""}</p>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* right profile panel */}
        <aside className="w-[420px] bg-white border-l p-6 mt-[48px] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
             
              <h3 className="text-xl font-semibold">Profile</h3>
            </div>

            <button
             onClick={()=>navigate('/profilepage')}
              className="text-xl text-gray-500 hover:text-gray-700 cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* profile content */}
          {selectedUser ? (
            <div className="flex flex-col items-start">
              <div className="w-full flex justify-center mb-4">
                <div className="relative">
                  <img src={selectedUser.profileImage || selectedUser.avatar || dp} alt="avatar" className="w-56 h-56 rounded-lg object-cover" />
                  <button className="absolute right-2 top-2 bg-white border px-3 py-1 rounded-md text-sm">Upload photo</button>
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{selectedUser.name}</h2>

                    <p className="text-gray-600 mt-2">{selectedUser.role}</p>

                    <div className="flex items-center gap-3 mt-4">
                      <span className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-600">
                        {onlineUsers ? <span className="text-blue-600">Active</span> : <span>Inactive</span>}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                      <CiClock2 className="font-bold text-xl text-black" />
                      <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} local time</span>
                    </div>
                  </div>

                  <button className="text-sm text-blue-600">Edit</button>
                </div>

                <div className="mt-6 flex gap-2">
                  <button className="px-2 border rounded flex items-center gap-2">
                    <LuMessageCircle />
                    Message
                  </button>

                  <button className="px-1 border rounded flex items-center gap-2">
                    <CiHeadphones /> Huddle ▾
                  </button>

                  <button className="px-3 border rounded flex items-center gap-2">
                    <CgProfile /> VIP
                  </button>

                  <button className="px-2 py-2 border rounded flex items-center">
                    <IoMdMore />
                  </button>
                </div>

                <p className="font-bold mt-[30px]">Contact information</p>
                <hr className="w-full my-3" />

                {selectedUser?.email && (
                  <div className="flex flex-row items-center gap-[20px]">
                    <div className="bg-blue-200 w-[25px] h-[25px] p-[3px] rounded">
                      <IoMailOutline />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-gray-700">Email address</p>
                      <p className="text-blue-700">{selectedUser.email}</p>
                    </div>
                  </div>
                )}

                {selectedUser?.number && (
                  <div className="flex flex-row items-center gap-[20px] mt-[15px]">
                    <div className="bg-blue-200 w-[25px] h-[25px] p-[3px] rounded">
                      <IoMailOutline />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-gray-700">Phone</p>
                      <p className="text-blue-700">{selectedUser.number}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-700 space-y-2">
                  {selectedUser.role && (
                    <div>
                      <div className="text-xs text-gray-400">Role</div>
                      <div className="font-medium">{selectedUser.role}</div>
                    </div>
                  )}

                  {selectedUser.location && (
                    <div>
                      <div className="text-xs text-gray-400">Location</div>
                      <div className="font-medium">{selectedUser.location}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">No user selected.</div>
          )}
          
        </aside>

      </div>
    

      {/* Filters modal (opens when clicking Filters) */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button className="absolute top-4 right-4 text-xl text-gray-600" onClick={() => setFilterOpen(false)}>
              <RxCross2 />
            </button>

            <h2 className="text-xl font-bold mb-4">Filter by</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <select className="w-full border rounded px-3 py-2" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)}>
                  <option value="">Any title</option>
                  <option value="software">Software Developer</option>
                  <option value="ceo">CEO</option>
                  <option value="cto">CTO</option>
                  <option value="devops">DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select className="w-full border rounded px-3 py-2" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                  <option value="">Any location</option>
                  <option value="remote">Remote</option>
                  <option value="india">India</option>
                  <option value="us">United States</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Workspaces</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select options...</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Celebration</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Any</option>
                  <option value="new">New hire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Account types</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Any account type</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Organisations</label>
                <select className="w-full border rounded px-3 py-2">
                  <option value="">Select options...</option>
                </select>
              </div>

              <div className="flex items-center justify-between mt-4">
                <a className="text-sm text-blue-600">Learn more about search</a>

                <div className="flex gap-3">
                  <button onClick={clearFilters} className="px-4 py-2 border rounded">
                    Clear filters
                  </button>

                  <button
                    onClick={() => {
                      setFilterOpen(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
