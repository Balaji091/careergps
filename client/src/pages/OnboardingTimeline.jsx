import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const OnboardingTimeline = () => {
  const navigate = useNavigate();
  const [months, setMonths] = useState(6);

  const handleSliderChange = (e) => {
    setMonths(Number(e.target.value));
  };

  const handleSegmentClick = (val) => {
    setMonths(val);
  };

  const handleContinue = () => {
    localStorage.setItem('onboarding_targetTimeline', `${months} Months`);
    navigate('/onboarding/hours');
  };

  // Logarithmic-style calculation for daily study time
  const intensity = Math.max(15, Math.round(270 / months));

  const segments = [3, 6, 9, 12];

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center select-none">
      {/* Top AppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-14 w-full border-b border-outline-variant/10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Logo textSize="text-base" />
        </Link>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-8 rounded-full bg-primary"></div>
          <div className="h-1.5 w-8 rounded-full bg-primary"></div>
          <div className="h-1.5 w-8 rounded-full bg-surface-container-highest"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-margin-mobile flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="space-y-2 mb-10">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            When is your target promotion?
          </h1>
          <p className="font-body-md text-on-surface-variant">
            We'll calibrate your growth trajectory based on your deadline.
          </p>
        </div>

        {/* Visual Month Counter */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex items-center justify-center flex-col">
          <span className="font-headline-xl text-headline-xl text-primary font-extrabold" id="display-months">
            {months}
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
            Months
          </span>
          {/* Decorative Grid */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#2a14b4 0.5px, transparent 0.5px)',
              backgroundSize: '16px 16px',
            }}
          ></div>
        </div>

        {/* Controls */}
        <div className="space-y-8 mb-8">
          {/* Segmented Buttons */}
          <div className="bg-surface-container-low p-1.5 rounded-xl flex gap-1 border border-outline-variant/50">
            {segments.map((val) => {
              const isActive = months === val;
              return (
                <button
                  key={val}
                  onClick={() => handleSegmentClick(val)}
                  className={`flex-1 py-3 rounded-lg font-label-md text-label-md transition-all duration-200 ${
                    isActive
                      ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/20 font-bold active-segment'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {val}m
                </button>
              );
            })}
          </div>

          {/* Slider */}
          <div className="relative px-2">
            <input
              className="custom-slider w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
              id="timeline-slider"
              max="18"
              min="3"
              step="1"
              type="range"
              value={months}
              onChange={handleSliderChange}
            />
            <div className="flex justify-between mt-3 text-on-surface-variant font-label-sm text-label-sm">
              <span>3 Months</span>
              <span>18 Months</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-auto">
          <div className="bg-secondary-fixed text-on-secondary-fixed-variant p-4 rounded-xl flex gap-3 border border-outline-variant/10 shadow-sm">
            <span className="material-symbols-outlined text-secondary shrink-0">info</span>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface mb-1">Projected daily study</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md text-primary font-bold" id="study-time">
                  {intensity}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">mins / day</span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                This pace aligns with top-quartile engineering leaders in your network.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action */}
      <footer className="fixed bottom-0 w-full p-margin-mobile bg-surface/90 backdrop-blur-md max-w-[480px] border-t border-outline-variant/10 py-6 z-50">
        <button
          onClick={handleContinue}
          className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Continue
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </footer>
    </div>
  );
};

export default OnboardingTimeline;
