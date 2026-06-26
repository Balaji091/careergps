import React from 'react';

const DashboardFab = ({ navigate }) => (
  <button
    onClick={() => navigate('/roadmap')}
    className="hidden md:flex fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group items-center gap-2 cursor-pointer"
  >
    <span className="material-symbols-outlined">bolt</span>
    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-label-md">Jump into Skill Lab</span>
  </button>
);

export default DashboardFab;
