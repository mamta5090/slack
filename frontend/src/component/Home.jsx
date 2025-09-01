import React from 'react';

const Home = () => {
  // A comment explaining the change: This component is simplified. The layout is handled by MainLayout.
  // It now only needs to render the content for the home/welcome page.
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Welcome to Koalaliving</h1>
        <p className="text-gray-600 mt-2">Select a conversation or start a new one.</p>
      </div>
    </div>
  );
};

export default Home;