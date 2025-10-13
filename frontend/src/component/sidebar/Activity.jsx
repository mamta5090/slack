import React, { useState, useEffect } from 'react';
import Topbar from '../../pages/Topbar';
import Sidebar from '../../pages/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivitiesForUser } from '../../redux/activitySlice';

// A simple presentational component (no changes needed here)
const ActivityItem = ({ activity }) => {
  const renderActivityText = () => {
    switch (activity.action) {
      case 'MENTION':
        return (
          <>
            <span className="font-bold">{activity.actor.name}</span> mentioned you in{' '}
            <span className="font-bold">#{activity.context.name}</span>
          </>
        );
      case 'THREAD_REPLY':
         return (
          <>
            <span className="font-bold">{activity.actor.name}</span> replied to a thread you are in{' '}
            <span className="font-bold">#{activity.context.name}</span>
          </>
        );
      case 'REACTION_ADDED':
        return (
          <>
            <span className="font-bold">{activity.actor.name}</span> reacted to your message.
          </>
        );
      default:
        return 'New activity';
    }
  };

  return (
    <div className="border-b border-gray-700 px-4 py-3 hover:bg-[#6a3a6c] transition-colors duration-200">
      <div className="flex items-start gap-3">
        <img src={activity.actor.profileImage || '/default-avatar.png'} alt="actor avatar" className="w-9 h-9 rounded" />
        <div className="flex-1">
          <p className="text-sm text-gray-100">{renderActivityText()}</p>
          {activity.contentSnippet && (
            <p className="text-sm text-gray-400 mt-1 p-2 border-l-2 border-gray-500">
              {activity.contentSnippet}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1.5">
            {new Date(activity.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!activity.isRead && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>}
      </div>
    </div>
  );
};



const Activity = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('All');
  const [showUnread, setShowUnread] = useState(false);
  //const { onlineUsers = [] } = useSelector((state) => state.socket) || {};


  const authState = useSelector((state) => state.user);
  const user = authState?.user; 

  const { currentWorkspace } = useSelector((state) => state.workspace);


  const { items: activities, status, error } = useSelector((state) => state.activityData);

  useEffect(() => {
    if (user?._id && currentWorkspace?._id) {
      dispatch(fetchActivitiesForUser({
        userId: user._id,
        workspaceId: currentWorkspace._id,
        unreadOnly: showUnread,
      }));
    }
  }, [dispatch, user?._id, currentWorkspace?._id, showUnread]);

  const filteredActivities = activities.filter(activity => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Mentions' && activity.action === 'MENTION') return true;
    if (activeTab === 'Threads' && activity.action === 'THREAD_REPLY') return true;
    if (activeTab === 'Reactions' && activity.action === 'REACTION_ADDED') return true;
    return false;
  });

  const renderContent = () => {
    if (status === 'loading') return <p className="p-4 text-gray-400">Loading activities...</p>;
    if (status === 'failed') return <p className="p-4 text-red-400">Error: {error}</p>;
    if (!user || !currentWorkspace) return <p className="p-4 text-gray-400">Please log in and select a workspace.</p>;
    if (filteredActivities.length > 0) {
      return filteredActivities.map(activity => <ActivityItem key={activity._id} activity={activity} />);
    }
    return <p className="p-4 text-gray-400">No activities to show.</p>;
  };

  const Tab = ({ label }) => (
    <p
      onClick={() => setActiveTab(label)}
      className={`font-semibold cursor-pointer pb-2 ${activeTab === label ? 'border-b-2 border-white text-white' : 'text-gray-400 hover:text-white'}`}
    >
      {label}
    </p>
  );

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden bg-[#3f0e40]">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="w-[460px] ml-[72px] mt-12 h-[calc(100vh-3rem)] bg-[#5a2a5c] text-gray-200 flex flex-col border-l border-r border-gray-700">
          <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="font-bold text-xl">Activity</h3>
            <label className="flex items-center text-xs cursor-pointer">
              <span className="mr-2 text-gray-300">Unread messages</span>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" checked={showUnread} onChange={() => setShowUnread(!showUnread)} />
                <div className="block bg-gray-600 w-8 h-4 rounded-full peer-checked:bg-green-500"></div>
                <div className="dot absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform peer-checked:translate-x-full"></div>
              </div>
            </label>
          </div>
          <div className="flex gap-4 p-4 border-b border-gray-700">
            <Tab label="All" /> <Tab label="Mentions" /> <Tab label="Threads" /> <Tab label="Reactions" /> <Tab label="Invitations" />
          </div>
          <div className="flex-1 overflow-y-auto">{renderContent()}</div>
        </div>
        <div className="flex-1 bg-white" >





        </div>
      </div>
    </div>
  );
};

export default Activity;