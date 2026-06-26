import React from 'react';

const SubjectProgress = ({
  progressPercent,
  completedCount,
  topics,
  totalHours,
  user,
  subject,
  handleLinkedInPost,
  linkedinState,
  allCompleted
}) => {
  return (
    <div className="space-y-gutter">
      {/* Progress Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-8 -translate-y-8">
          <span className="material-symbols-outlined text-[128px]">trending_up</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Overall Progress</h3>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-primary">{progressPercent}%</span>
          <span className="text-on-surface-variant text-label-md mb-1 font-semibold">On Track</span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_8px_rgba(42,20,180,0.3)]" style={{ width: `${progressPercent}%` }}></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-surface-container rounded-lg">
            <p className="text-on-surface-variant text-label-sm mb-1">Completed</p>
            <p className="font-bold text-lg">{completedCount} / {topics.length} Topics</p>
          </div>
          <div className="p-3 bg-surface-container rounded-lg">
            <p className="text-on-surface-variant text-label-sm mb-1">Estimated Hours</p>
            <p className="font-bold text-lg">{totalHours} Hours</p>
          </div>
        </div>
      </div>

      {/* Badges Available */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-sm">
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4">Badges Available</h3>
        <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shrink-0">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              architecture
            </span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface">Subject Master</h4>
            <p className="text-body-sm text-on-surface-variant leading-tight">
              Master design patterns &amp; verify competency.
            </p>
          </div>
        </div>
      </div>

      {/* LinkedIn Integration */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">LinkedIn Preview</h3>
          <span className="material-symbols-outlined text-[#0A66C2]">share</span>
        </div>
        <div className="bg-surface p-4 rounded-lg border border-outline-variant/20 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-[10px] text-on-primary-container font-bold shadow-inner">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold">{user?.name || 'User'}</span>
              <span className="text-[10px] text-on-surface-variant leading-none">{user?.profile?.targetRole || 'Engineering Path'}</span>
            </div>
          </div>
          <p className="text-[13px] text-on-surface leading-snug">
            I'm excited to share that I've just mastered <b>{subject?.name}</b> on Career GPS! 🚀 Ready to apply these insights to our next big scale-up! #CareerGPS #LearningJourney
          </p>
          <div className="h-24 bg-surface-container-high rounded-md flex flex-col items-center justify-center border border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-primary/40 text-3xl">verified</span>
            <span className="text-[10px] font-medium text-on-surface-variant">Certification: {subject?.name}</span>
          </div>
          <button 
            onClick={handleLinkedInPost}
            disabled={linkedinState !== 'idle' || !allCompleted}
            className={`w-full py-2 text-white text-[12px] font-bold rounded-full transition-all duration-200 ${
              !allCompleted 
                ? 'bg-slate-300 dark:bg-slate-700 text-on-surface-variant/40 cursor-not-allowed opacity-50' 
                : linkedinState === 'posting' 
                ? 'bg-slate-400 cursor-wait' 
                : linkedinState === 'posted'
                ? 'bg-emerald-600'
                : 'bg-[#0A66C2] hover:bg-[#004182] active:scale-95 shadow-md'
            }`}
          >
            {linkedinState === 'posting' ? 'Sharing...' : linkedinState === 'posted' ? 'Badge Shared! ✔' : 'Share Master Badge'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectProgress;
