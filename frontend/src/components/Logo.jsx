import React from 'react';
import { Compass } from 'lucide-react';

const Logo = ({ className = '', iconSize = 'w-4 h-4', textSize = 'text-base', showText = true }) => {
  return (
    <div className={`flex items-center space-x-2 select-none ${className}`}>
      {/* Decorative gradient icon background */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md shadow-blue-500/20 text-white shrink-0">
        <Compass className={iconSize} />
      </div>
      {showText && (
        <span className={`font-extrabold tracking-tight text-[#111827] ${textSize}`}>
          Career<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">GPS</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
