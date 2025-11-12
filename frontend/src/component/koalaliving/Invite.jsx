import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
const DEFAULT_CHANNELS = [
  { id: "hr-activities", name: "#hr-activities" },
  { id: "cyrus", name: "#cyrus" },
  { id: "general", name: "#general" },
  { id: "random", name: "#random" },
  { id: "dev", name: "#dev" },
];

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

export default function Invite({ workspaceName = "Koalaliving", channels = DEFAULT_CHANNELS }) {
  const [open, setOpen] = useState(false);

  
  const [emailText, setEmailText] = useState("");
  const [emails, setEmails] = useState([]);

  
  const [role, setRole] = useState("Member");
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [channelSearch, setChannelSearch] = useState("");
  const [message, setMessage] = useState("");

  const modalRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    
    setTimeout(() => inputRef.current?.focus(), 50);

    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const addEmailToken = (raw) => {
    if (!raw) return;
    const split = raw
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!split.length) return;
    setEmails((prev) => {
      const next = [...prev];
      for (const e of split) {
        // avoid duplicates
        if (!next.some((t) => t.value.toLowerCase() === e.toLowerCase())) {
          next.push({ value: e, valid: isValidEmail(e) });
        }
      }
      return next;
    });
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addEmailToken(emailText);
      setEmailText("");
    } else if (e.key === "Backspace" && !emailText && emails.length) {

      setEmails((prev) => prev.slice(0, prev.length - 1));
    }
  };

  const removeEmail = (value) => {
    setEmails((prev) => prev.filter((t) => t.value !== value));
  };

  const toggleChannel = (id) => {
    setSelectedChannels((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCopyInviteLink = async () => {
    const link = `${window.location.origin}/invite/${workspaceName.toLowerCase()}`; // placeholder
    try {
      await navigator.clipboard.writeText(link);
      alert("Invite link copied to clipboard");
    } catch {
      alert("Unable to copy link");
    }
  };

const handleSend = async () => {
  const valid = emails.filter((e) => e.valid).map((e) => e.value);
  if (!valid.length) {
    alert("Please add at least one valid email.");
    return;
  }
  try {
    const payload = {
      emails: valid,
      role,
      channels: selectedChannels,
      message,
      workspace: workspaceName,
    };
    // axios: second arg = body, third arg = config
    const res = await axios.post(
      "/api/invite/invitelink",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // axios returns parsed JSON in res.data
    console.log("Invite response:", res.data);
    alert(`Invites sent to ${valid.length} user(s).`);

    setEmails([]);
    setEmailText("");
    setMessage("");
    setSelectedChannels([]);
    setOpen(false);
  } catch (err) {
    console.error("Invite request failed:", err);
    const message = err?.response?.data?.error || err.message || "Unknown error";
    alert("Error sending invites: " + message);
  }
};



  const filteredChannels = channels.filter((c) => c.name.toLowerCase().includes(channelSearch.toLowerCase()));

  const validCount = emails.filter((e) => e.valid).length;

  return (
    <>
      {/* Trigger button */}
      <button
        className="text-left px-4 py-3 border-b  hover:bg-[#275982] hover:text-white w-full text-sm"
        onClick={() => setOpen(true)}
      >
        Invite people to {workspaceName}
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-6 px-4">
          <div className="fixed inset-0 bg-black/40" />

          <div
            ref={modalRef}
            className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl z-60 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h3 className="text-lg font-semibold">Invite people to {workspaceName}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="px-6  space-y-4">
              <div>
                <label className="text-sm  font-bold">Send to</label>
                <div className="mt-2">
                  <div className="min-h-[56px] border rounded-md p-2 flex flex-wrap gap-2 items-center">
                    {emails.map((t) => (
                      <div
                        key={t.value}
                        className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${
                          t.valid ? "bg-indigo-100 text-indigo-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        <span>{t.value}</span>
                        <button
                          onClick={() => removeEmail(t.value)}
                          className="text-xs font-bold ml-1"
                          aria-label={`Remove ${t.value}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <input
                      ref={inputRef}
                      value={emailText}
                      onChange={(e) => setEmailText(e.target.value)}
                      onKeyDown={handleEmailKeyDown}
                      onBlur={() => {
                        addEmailToken(emailText);
                        setEmailText("");
                      }}
                      placeholder="name@gmail.com"
                      className="flex-1 min-w-[160px] outline-none px-2 py-1 text-sm"
                    />
                  </div>
                  
                </div>
              </div>

              {/* OR & Google */}
              <div className="flex items-center gap-3">
                <div className="flex-grow h-px bg-gray-200" />
                <div className="text-xs text-gray-400">OR</div>
                <div className="flex-grow h-px bg-gray-200" />
              </div>

              <div>
               <a href="www.google.com.">
                 <button
                  type="button"
                  onClick={() => alert("Continue with Google (placeholder)")}
                  className="w-full border px-3 py-2 rounded-md flex items-center justify-center gap-2 text-sm hover:bg-gray-50"
                >
                  <img alt="google" src="https://www.gstatic.com/images/branding/product/1x/google_48dp.png" className="w-5 h-5" />
                  Continue with Google Workspace
                </button>
               </a>
              </div>

              {/* Role select */}
              <div>
                <label className="text-sm font-medium text-gray-700">Invite as</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-2 w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option>Member</option>
                  <option>Guest</option>
                  <option>Admin</option>
                </select>
              </div>

              {/* Channels */}
              <div>
                <label className="text-sm font-medium text-gray-700">Add to team channels (optional)</label>
                <p className="text-xs text-gray-500 mt-1">Make sure your teammates are in the right conversations from the get go.</p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {/* suggested chips */}
                  {channels.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleChannel(c.id)}
                      className={`px-2 py-1 rounded-full text-sm border ${
                        selectedChannels.includes(c.id) ? "bg-sky-100 border-sky-400" : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      + {c.name}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <input
                    placeholder="Search channels"
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />

                  {channelSearch && (
                    <div className="mt-2 max-h-36 overflow-auto border rounded-md p-2 bg-white">
                      {filteredChannels.length ? (
                        filteredChannels.map((c) => (
                          <div key={c.id} className="flex items-center justify-between py-1">
                            <div className="text-sm text-gray-700">{c.name}</div>
                            <button
                              onClick={() => toggleChannel(c.id)}
                              className={`text-sm px-2 py-1 rounded ${
                                selectedChannels.includes(c.id) ? "bg-sky-100" : "bg-gray-100"
                              }`}
                            >
                              {selectedChannels.includes(c.id) ? "Added" : "Add"}
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400">No channels match</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Optional message */}
              <div>
                <label className="text-sm font-medium text-gray-700">Add a message (optional)</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a short note to the people you are inviting"
                  className="mt-2 w-full border rounded-md p-2 text-sm"
                />
              </div>

              {/* Bottom actions */}
              <div className="flex items-center justify-between gap-4">
                <button
                  onClick={handleCopyInviteLink}
                  className="flex items-center gap-2 border px-3 py-2 rounded-md text-sm hover:bg-gray-50"
                >
                  Copy invite link
                </button>

                <div className="ml-auto flex items-center gap-3">
                  <button
                    onClick={() => {
                      setOpen(false);
                    }}
                    className="px-4 py-2 rounded-md text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSend}
                    disabled={validCount === 0}
                    className={`px-4 py-2 rounded-md text-sm text-white ${validCount === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
