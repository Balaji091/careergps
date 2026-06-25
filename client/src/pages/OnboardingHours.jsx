import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const OnboardingHours = () => {
  const navigate = useNavigate();
  const [hours, setHours] = useState(2);

  const handleSliderChange = (e) => {
    setHours(Number(e.target.value));
  };

  const handleSegmentClick = (val) => {
    setHours(val);
  };

  const handleContinue = () => {
    localStorage.setItem('onboarding_dailyStudyTime', hours);
    navigate('/onboarding/loading');
  };

  const weeklyCommitment = hours * 7;

  const segments = [1, 2, 3, 4];

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
          <div className="h-1.5 w-8 rounded-full bg-primary"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-32 px-margin-mobile flex flex-col max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="space-y-2 mb-10">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            What's your daily study goal?
          </h1>
          <p className="font-body-md text-on-surface-variant">
            We'll calibrate your curriculum load based on your daily commitment.
          </p>
        </div>

        {/* Visual Hour Counter */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex items-center justify-center flex-col">
          <span className="font-headline-xl text-headline-xl text-primary font-extrabold" id="display-hours">
            {hours}
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
            {hours === 1 ? 'Hour' : 'Hours'} / Day
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
              const isActive = hours === val;
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
                  {val}h
                </button>
              );
            })}
          </div>

          {/* Slider */}
          <div className="relative px-2">
            <input
              className="custom-slider w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
              id="hours-slider"
              max="6"
              min="1"
              step="1"
              type="range"
              value={hours}
              onChange={handleSliderChange}
            />
            <div className="flex justify-between mt-3 text-on-surface-variant font-label-sm text-label-sm">
              <span>1 Hour</span>
              <span>6 Hours</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="mt-auto">
          <div className="bg-secondary-fixed text-on-secondary-fixed-variant p-4 rounded-xl flex gap-3 border border-outline-variant/10 shadow-sm">
            <span className="material-symbols-outlined text-secondary shrink-0">info</span>
            <div>
              <h3 className="font-label-md text-label-md text-on-surface mb-1">Projected weekly study</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-headline-md text-headline-md text-primary font-bold" id="weekly-time">
                  {weeklyCommitment}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">hours / week</span>
              </div>
              <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
                Consistency beats intensity. Short daily sessions yield the best spaced repetition recall rates.
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

export default OnboardingHours;
