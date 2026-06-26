import React from 'react';

/**
 * CompassLoader – A branded rotating compass loader for Career GPS.
 * Features a rotating compass icon with dark blue filled circles
 * that spread outward like a sonar pulse.
 */
const CompassLoader = ({ size = 'text-6xl', label, fullScreen = false }) => {
  return (
    <div className={`flex flex-col ${fullScreen ? 'h-screen' : 'h-[60vh]'} w-full items-center justify-center gap-5`}>
      {/* Compass + Spread Container */}
      <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>

        {/* Spread 1 – Solid dark blue expanding fill */}
        <div
          className="absolute rounded-full bg-primary/25 animate-compass-ripple"
          style={{ width: 60, height: 60 }}
        />

        {/* Spread 2 – Staggered */}
        <div
          className="absolute rounded-full bg-primary/20 animate-compass-ripple"
          style={{ width: 60, height: 60, animationDelay: '0.7s' }}
        />

        {/* Spread 3 – Staggered */}
        <div
          className="absolute rounded-full bg-primary/15 animate-compass-ripple"
          style={{ width: 60, height: 60, animationDelay: '1.4s' }}
        />

        {/* Compass icon – rotates */}
        <div className="relative z-10 animate-compass-spin">
          <span
            className={`material-symbols-outlined ${size} text-primary drop-shadow-[0_0_14px_rgba(42,20,180,0.5)]`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            explore
          </span>
        </div>
      </div>

      {/* Optional label */}
      {label && (
        <p className="font-label-md text-label-md text-on-surface-variant animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export default CompassLoader;
