import React from 'react';

const PlannerHeader = ({ formattedDate, maxXp, streak, targetRole, userLevel, xp }) => (
  <header className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
    <div>
      <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight font-bold">Daily Planner</h2>
      <p className="font-body-md text-body-sm sm:text-body-md text-on-surface-variant font-medium">
        {formattedDate} • Level {userLevel} {targetRole} Path
      </p>
    </div>
    <div className="flex gap-2 sm:gap-stack-md shrink-0">
      <StatCard icon="local_fire_department" label="STREAK" tone="orange" value={streak} suffix="days" />
      <StatCard icon="bolt" label="DAILY XP" tone="primary" value={xp} suffix={`/ ${maxXp}`} />
    </div>
  </header>
);

const StatCard = ({ icon, label, suffix, tone, value }) => {
  const toneClass = tone === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-primary/10 text-primary';

  return (
    <div className="tonal-card p-3 sm:p-4 rounded-xl flex items-center gap-3 sm:gap-4 bg-white min-w-0 sm:min-w-[140px] flex-1 border border-outline-variant/20 shadow-sm">
      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${toneClass} flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined filled-icon text-lg sm:text-xl">{icon}</span>
      </div>
      <div>
        <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">{label}</p>
        <p className="font-headline-md text-headline-md text-on-surface leading-none font-black">
          {value} <span className="text-label-sm font-semibold">{suffix}</span>
        </p>
      </div>
    </div>
  );
};

export default PlannerHeader;
