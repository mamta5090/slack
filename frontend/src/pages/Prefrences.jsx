import axios from "axios";
import React, { useEffect, useState } from "react";

const Preferences = ({ onClose, userId }) => {
  const [activeTab, setActiveTab] = useState("Notifications");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const sidebarItems = [
    { name: "Notifications", icon: "🔔" },
    { name: "VIP", icon: "⭐" },
    { name: "Navigation", icon: "🧭" },
    { name: "Home", icon: "🏠" },
    { name: "Appearance", icon: "✨" },
    { name: "Messages & media", icon: "💬" },
    { name: "Language & region", icon: "🌐" },
    { name: "Accessibility", icon: "♿" },
    { name: "Mark as read", icon: "✔️" },
    { name: "Audio and video", icon: "🎥" },
    { name: "Salesforce", icon: "☁️" },
    { name: "Connected accounts", icon: "🔗" },
    { name: "Privacy and visibility", icon: "🔒" },
    { name: "Slack AI", icon: "✨" },
    { name: "Advanced", icon: "⚙️" },
  ];

  // Fetch initial data
  useEffect(() => {
     if (!userId) {
      console.error("Preferences Component: userId prop is missing!");
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }
     const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/preferences/${userId}`);
        
        // Ensure we handle the data structure correctly
        const data = res.data.notifications || res.data;
        setSettings(data);
        setError(null);
      } catch (err) {
        console.error("Error loading preferences:", err);
        setError("Failed to load settings from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  // Save data to backend
  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await axios.patch(`/api/preferences/${userId}`, {
        notifications: settings,
      });
      alert("Changes saved successfully!");
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1c1d]/70 backdrop-blur-[2px]">
        <div className="bg-white p-8 rounded-lg shadow-xl">Loading Preferences...</div>
      </div>
    );
  }

   if (error || !settings) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1c1d]/70 backdrop-blur-[2px]">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center">
          <p className="text-red-500 font-bold mb-4">{error || "Something went wrong"}</p>
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1d1c1d]/70 backdrop-blur-[2px] p-4 md:p-10 font-sans text-left">
      <div className="flex h-full max-h-[850px] w-full max-w-[920px] overflow-hidden rounded-lg bg-white shadow-2xl border border-gray-300">
        
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-[#f8f8f8] py-8 flex flex-col">
          <h2 className="px-6 mb-4 text-[26px] font-black text-[#1d1c1d] tracking-tight">Preferences</h2>
          <nav className="overflow-y-auto flex-1 custom-scrollbar">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`flex w-full items-center gap-3 px-6 py-1.5 text-[15px] transition-none ${
                  activeTab === item.name
                    ? "bg-[#1264a3] text-white font-medium"
                    : "text-[#1d1c1d] hover:bg-[#e8e8e8]"
                }`}
              >
                <span className="text-[16px]">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="relative flex flex-1 flex-col bg-white">
          <button onClick={onClose} className="absolute right-6 top-6 z-10 text-gray-400 hover:text-black">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="flex-1 overflow-y-auto p-10 pt-14 custom-scrollbar">
            {activeTab === "Notifications" ? (
                <NotificationSettings 
                    settings={settings} 
                    setSettings={setSettings} 
                    handleSave={handleSave} 
                    isSaving={isSaving}
                />
            ) : (
               <div className="flex h-64 items-center justify-center text-gray-400 italic">Content for {activeTab} coming soon...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationSettings = ({ settings, setSettings, handleSave, isSaving }) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Helper to update state values
  const updateField = (path, value) => {
    const keys = path.split('.');
    setSettings(prev => {
        const newSettings = { ...prev };
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return { ...newSettings };
    });
  };

  return (
    <div className="space-y-10 text-[#1d1c1d]">
      
      {/* Messaging Defaults */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-black">Messaging defaults</h3>
          <button className="text-[14px] font-bold text-[#1264a3] hover:underline flex items-center ">
             <span className="bg-[#1264a3] text-white rounded-full w-[18px] h-[18px] flex items-center justify-center text-[10px] mr-1">?</span>
             About notifications
          </button>
        </div>
        <p className="text-[15px] text-[#616061] mb-6">Tell us what you’d generally like to be notified about. You can also set specific rules for specific conversations.</p>

        <div className="space-y-4">
          <h4 className="font-bold text-[15px]">How to notify you</h4>
          <p className="text-[15px] text-[#616061]">These appear as a banner on your desktop or mobile device.</p>
          <div className="space-y-2.5">
            <Checkbox 
                label="Desktop notifications" 
                checked={settings.messagingDefaults.desktopNotifications} 
                onChange={(e) => updateField('messagingDefaults.desktopNotifications', e.target.checked)}
            />
             <Checkbox 
                label="Mobile notifications" 
                checked={settings?.messagingDefaults?.mobileNotifications ?? true} 
                onChange={(e) => updateField('messagingDefaults.mobileNotifications', e.target.checked)}
            />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <h4 className="font-bold text-[15px]">What to notify you about</h4>
          <CustomSelect 
            icon="📢" 
            options={["Everything", "Direct messages, mentions & keywords", "Nothing"]} 
            value={settings.messagingDefaults.notifyAbout}
            onChange={(e) => updateField('messagingDefaults.notifyAbout', e.target.value)}
          />
        </div>
      </section>

      {/* Also Notify You About */}
      <section className="space-y-4">
        <h4 className="font-bold text-[15px]">Also notify you about:</h4>
        <div className="space-y-2.5">
          <Checkbox 
            label="Thread replies" 
            checked={settings.alsoNotifyAbout.threadReplies} 
            onChange={(e) => updateField('alsoNotifyAbout.threadReplies', e.target.checked)}
          />
          <Checkbox 
            label="Messages from VIPs, even if notifications are paused" 
            checked={settings.alsoNotifyAbout.vipMessages} 
            onChange={(e) => updateField('alsoNotifyAbout.vipMessages', e.target.checked)}
          />
          <Checkbox 
            label="New huddles" 
            checked={settings.alsoNotifyAbout.newHuddles} 
            onChange={(e) => updateField('alsoNotifyAbout.newHuddles', e.target.checked)}
          />
          <Checkbox 
            label="Include thread replies in badge counts on Activity" 
            checked={settings.alsoNotifyAbout.activityBadgeCount} 
            onChange={(e) => updateField('alsoNotifyAbout.activityBadgeCount', e.target.checked)}
          />
        </div>
      </section>

      {/* Channel Keywords */}
      <section className="space-y-2">
        <h4 className="font-bold text-[15px]">Channel keywords</h4>
        <p className="text-[15px] text-[#616061]">These act like mentions, but can be set for topics that are important to you.</p>
        <textarea 
            className="w-full border border-gray-300 rounded-md p-3 h-24 mt-2 focus:ring-1 focus:ring-[#1264a3] outline-none" 
            placeholder="e.g. status, design, meeting" 
            value={settings.channelKeywords}
            onChange={(e) => updateField('channelKeywords', e.target.value)}
        />
      </section>

      {/* Notification Schedule */}
      <section className="pt-8 border-t border-gray-200">
        <h3 className="text-lg font-black mb-4">Notification schedule</h3>
        <div className="mb-6">
           <label className="block text-[15px] font-bold mb-2">Allow notifications:</label>
           <select 
                className="rounded border border-gray-300 px-3 py-1.5 text-[15px] w-44 outline-none"
                value={settings.schedule.type}
                onChange={(e) => updateField('schedule.type', e.target.value)}
           >
              <option>Every day</option>
              <option>Custom</option>
           </select>
        </div>
        <div className="space-y-3">
          {days.map((day, idx) => (
            <div key={day} className="flex items-center gap-4 text-[15px]">
              <span className="w-24 text-gray-700">{day}</span>
              <TimeSelect defaultValue={settings.schedule.days[idx]?.start || "9:00 AM"} />
              <span className="text-gray-400">to</span>
              <TimeSelect defaultValue={settings.schedule.days[idx]?.end || "6:00 PM"} />
            </div>
          ))}
        </div>
      </section>

      {/* Mobile Activity Section */}
      <section className="pt-8 border-t border-gray-200 space-y-4">
        <h4 className="font-bold text-[15px]">When you’re not active on desktop...</h4>
        <p className="text-[15px] text-[#616061]">Send notifications to my <span className="font-bold">mobile devices:</span></p>
        <CustomSelect 
            options={["As soon as I'm inactive", "After I've been inactive for 2 minutes", "After 5 minutes"]} 
            width="w-72" 
            value={settings.mobileActivity.inactiveTimeout}
            onChange={(e) => updateField('mobileActivity.inactiveTimeout', e.target.value)}
        />
        <Checkbox 
            label="Include a summary of activity I've missed" 
            checked={settings.mobileActivity.summaryNotification} 
            onChange={(e) => updateField('mobileActivity.summaryNotification', e.target.checked)}
        />
      </section>

      {/* Action Button */}
      <section className="pt-8 border-t border-gray-200">
         <button 
            className={`w-full py-3 rounded-md text-[16px] font-bold text-white transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1264a3] hover:bg-[#0e4a78]'}`} 
            onClick={handleSave}
            disabled={isSaving}
         >
            {isSaving ? "Saving changes..." : "Save Changes"}
         </button>
      </section>
    </div>
  );
};

// Reusable Components
const Checkbox = ({ label, description, checked, onChange }) => (
  <label className="flex items-start gap-3 cursor-pointer group">
    <div className="relative flex items-center mt-[3px]">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={onChange}
        className="peer h-[18px] w-[18px] rounded border border-gray-400 checked:bg-[#007a5a] checked:border-[#007a5a] appearance-none cursor-pointer" 
      />
      <svg className="absolute w-3.5 h-3.5 text-white left-[2px] hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 13l4 4L19 7"/></svg>
    </div>
    <div className="text-[15px]">
       <span className="text-[#1d1c1d]">{label}</span>
       {description && <span className="ml-1 text-gray-500">{description}</span>}
    </div>
  </label>
);

const CustomSelect = ({ icon, options, width = "w-full", value, onChange }) => (
  <div className={`relative ${width}`}>
    {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
    <select 
        value={value}
        onChange={onChange}
        className={`appearance-none rounded border border-gray-300 bg-white py-2 ${icon ? 'pl-10' : 'pl-3'} pr-10 text-[15px] w-full outline-none focus:ring-1 focus:ring-[#1264a3]`}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
    </div>
  </div>
);

const TimeSelect = ({ defaultValue, width = "w-32" }) => (
  <select className={`rounded border border-gray-300 px-2 py-1 text-[14px] bg-white outline-none ${width}`} defaultValue={defaultValue}>
    <option>8:00 AM</option>
    <option>9:00 AM</option>
    <option>10:00 AM</option>
    <option>5:00 PM</option>
    <option>6:00 PM</option>
  </select>
);

export default Preferences;