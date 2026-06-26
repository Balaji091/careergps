import React from 'react';

const ReadinessCard = ({ readinessPercent, readinessAdvice }) => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(readinessPercent, 100)) / 100;

  return (
    <div className="lg:col-span-4 bg-white rounded-xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center text-center">
      <div className="relative w-48 h-48 mb-6">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-surface-container" cx="50" cy="50" fill="transparent" r={radius} stroke="currentColor" strokeWidth="8" />
          <circle
            className="text-primary progress-ring__circle"
            cx="50"
            cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline-xl text-headline-xl text-primary font-black">{readinessPercent}%</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Readiness</span>
        </div>
      </div>
      <h3 className="font-headline-md text-headline-md mb-2 text-on-surface font-bold">
        {readinessPercent >= 75 ? 'Almost Market Ready' : readinessPercent >= 50 ? 'Tracking Well' : 'Needs Focus'}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{readinessAdvice}</p>
    </div>
  );
};

export default ReadinessCard;
