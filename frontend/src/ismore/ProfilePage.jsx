import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import Topbar from "../pages/Topbar";
import Sidebar from "../pages/Sidebar";
import { ImProfile } from "react-icons/im";
import dp from "../assets/dp.webp";
import { CiSearch } from "react-icons/ci";
import { IoFilter } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const allUsers = useSelector((state) => state.user.allUsers) || [];
  const currentUser = useSelector((state) => state.user.user); // logged-in user
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("most"); // placeholder for dropdown
  const [titleFilter, setTitleFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [open, setOpen] = useState(false);
  const navigate=useNavigate()

  // filtered users derived from allUsers
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return allUsers.filter((u) => {
      if (!u) return false;
      const matchQuery =
        !query ||
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.role && u.role.toLowerCase().includes(query));
      const matchTitle =
        !titleFilter || (u.role && u.role.toLowerCase().includes(titleFilter));
      const matchLocation =
        !locationFilter ||
        (u.location && u.location.toLowerCase().includes(locationFilter));
      return matchQuery && matchTitle && matchLocation;
    });
  }, [allUsers, q, titleFilter, locationFilter]);

  // helper to clear filters inside modal
  const clearFilters = () => {
    setTitleFilter("");
    setLocationFilter("");
    setSort("most");
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Topbar */}
      <div className="flex-shrink-0">
        <Topbar />
      </div>

      {/* Sidebar + Main */}
      <div className="flex flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="flex bg-[#532755] text-white">
          <Sidebar />
        </div>

        {/*left box  */}
        <div className="bg-[#532755]  lg:w-[350px] sm:w-[200px] ml-[72px] mt-[48px] pt-[30px] pl-[30px] flex flex-col">
          <p className="text-white">People</p>

          <div className="flex flex-row  gap-[10px] pt-[10px]  items-center text-white hover:text-[#39063a] hover:bg-[#f9edff] hover:rounded-xl hover:p-[5px]">
            <ImProfile className="text-white hover:text-[#39063a]" />
            <p className="flex ">All people</p>
          </div>

          <div className="flex flex-row text-white hover:text-[#39063a] hover:bg-[#f9edff] hover:rounded-xl hover:p-[5px]  gap-[10px] pt-[10px] items-center ">
            <ImProfile className="text-white hover:text-[#39063a]" />
            <p>User groups</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6  mt-[48px] overflow-y-auto bg-[#f8f8f8] ">
          <div className="flex flex-col ">
            <div className="flex flex-row justify-between items-center">
              <p className="font-bold text-2xl">All people</p>
              <button className="rounded-xl font-semibold bg-white p-[5px] border ">
                Invite poeple
              </button>
            </div>

            <div
              className="
  bg-white 
  border 
  m-5 
  rounded-xl 
  flex 
  items-center 
  px-3 
  h-10
  md:w-[90%]
  shadow-[0_0_5px_5px_rgba(30,64,175,0.4)]
"
            >
              <CiSearch className="text-black text-lg mr-2" />
              <input
                type="text"
                placeholder="Search for people"
                className="flex-1 rounded-xl outline-none p-2"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>

          <div className="flex  justify-between items-center gap-[8px]  px-[5px]">
              {/* Title select */}
              <select
                className="bg-white border border-black w-[60px]  h-[30px] rounded"
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

              {/* Location select */}
              <select
                className="bg-white border border-black w-[85px]  h-[30px] rounded items-center"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">Location</option>
                <option value="remote">Remote</option>
                <option value="india">India</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
              </select>

              {/* Filters button (opens panel) */}
              <button
                type="button"
                className="flex items-center gap-2 bg-transparent"
                onClick={() => setOpen(true)}
              >
                <IoFilter className="text-xl" />
                <p className="font-semibold">Filters</p>
              </button>

              {/* Sort */}
              <div className="relative ml-auto">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-white border rounded  py-1"
                >
                  <option value="most">Most recommended</option>
                  <option value="recent">Recently active</option>
                </select>
              </div>
            </div>  
          </div>

          {/* Results */}
          <div className="mt-3 ml-10 mr-10">
            {filtered.length === 0 ? (
              <div className="text-gray-500">No people found.</div>
            ) : (
              <div className="h-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {filtered.map((cardUser, i) => {
                  const key = cardUser._id || cardUser.id || i;
                  return (
                    <div
                      key={key}
                      className="relative bg-white rounded-lg border p-4 shadow-sm hover:shadow-md transition"
                    >
                      {/* top-right edit button for current logged-in user */}
                      {currentUser && cardUser._id === currentUser._id && (
                        <button className="absolute top-3 right-3 bg-white border rounded-full px-2 py-1 text-sm"
                        onClick={()=>navigate('/profile')}>
                          Edit
                        </button>
                      )}

                      <div className="flex flex-col items-center text-center">
                        <div className="relative">
                          <img
                            src={cardUser.avatar || dp}
                            alt={cardUser.name || "User Avatar"}
                            className="w-28 h-28 rounded-full object-cover mb-3"
                          />
                          {/* online indicator */}
                          {cardUser?.isOnline && (
                            <span className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                          )}
                        </div>

                        <h3 className="font-semibold text-lg">{cardUser?.name}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {cardUser?.role || "—"}
                        </p>
                        <p className="text-gray-400 text-xs mt-2">
                          {cardUser?.location || ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Panel Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 px-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <button
              className="absolute top-4 right-4 text-xl text-gray-600"
              onClick={() => setOpen(false)}
            >
              <RxCross2 />
            </button>

            <h2 className="text-xl font-bold mb-4">Filter by</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                >
                  <option value="">Any title</option>
                  <option value="software">Software Developer</option>
                  <option value="ceo">CEO</option>
                  <option value="cto">CTO</option>
                  <option value="devops">DevOps Engineer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
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
                  <button
                    onClick={() => {
                      clearFilters();
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Clear filters
                  </button>

                  <button
                    onClick={() => {
                      setOpen(false);
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

export default ProfilePage;
