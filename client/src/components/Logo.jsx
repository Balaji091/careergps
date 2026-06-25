import React from 'react';

const Logo = ({ className = '', textSize = 'text-xl' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Sleek Compass Icon Container */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2a14b4] to-[#4648d4] flex items-center justify-center shadow-md relative overflow-hidden group shrink-0">
        {/* Diagonal needle shape */}
        <div className="w-1.5 h-5 bg-white rounded-full rotate-45 transform transition-transform group-hover:rotate-[225deg] duration-500" />
        <div className="absolute w-1 h-1 bg-blue-300 rounded-full" />
      </div>
      <span className={`${textSize} font-black tracking-tight text-on-surface font-headline-lg`}>
        <span className="bg-gradient-to-r from-[#2a14b4] to-[#4648d4] bg-clip-text text-transparent">Career</span> GPS
      </span>
    </div>
  );
};

export default Logo;
