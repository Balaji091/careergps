import React from 'react';

const ActiveRecallSection = ({
  activeRecallCard,
  atRiskCount,
  dueRevisions,
  handleRecallAnswer,
  handleSkipRecall,
  learnedCount,
  navigate,
  overallMastery,
  recallDueCount,
  reviewingCount,
  setShowDrillModal,
  setShowRecallAnswer,
  showRecallAnswer,
  targetRole,
}) => (
  <section className="lg:col-span-5 space-y-stack-md">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Active Recall</h3>
      <span className="font-label-md text-label-md text-on-surface-variant font-bold">{recallDueCount} Due Today</span>
    </div>
    <div className="space-y-4">
      {dueRevisions.length > 0 ? (
        <div className="tonal-card p-6 rounded-xl border-l-4 border-l-secondary bg-white relative overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 p-4">
            <span className="material-symbols-outlined text-secondary/20 text-4xl">psychology</span>
          </div>
          <h5 className="font-label-md text-label-md text-secondary mb-2 tracking-wider font-bold">KNOWLEDGE DRILL</h5>
          <p className="font-body-lg text-body-md sm:text-body-lg font-bold text-on-surface pr-10 leading-snug">{activeRecallCard.q}</p>
          {showRecallAnswer && (
            <div className="mt-4 p-4 bg-surface-container rounded-lg text-xs sm:text-sm leading-relaxed text-on-surface border border-outline-variant/30 animate-in slide-in-from-top-2 duration-300">
              <p className="leading-relaxed">{activeRecallCard.a}</p>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => handleRecallAnswer('again')} className="px-3 py-1 bg-white hover:bg-red-50 text-error border border-error-container text-xs font-bold rounded-lg transition-colors cursor-pointer">Study Again</button>
                <button onClick={() => handleRecallAnswer('easy')} className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-colors cursor-pointer">
                  Easy ({dueRevisions.length > 0 ? '+10 XP' : '+30 XP'})
                </button>
              </div>
            </div>
          )}
          {!showRecallAnswer && (
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowRecallAnswer(true)} className="flex-1 bg-primary text-white py-2 rounded-lg font-label-md text-label-md font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer">Show Answer</button>
              <button onClick={handleSkipRecall} className="px-4 bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined">skip_next</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="tonal-card p-6 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/20 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-secondary/10 text-secondary flex items-center justify-center rounded-xl">
            <span className="material-symbols-outlined text-2xl animate-pulse">check_circle</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface">All caught up!</h4>
            <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">You have no spaced-repetition knowledge drills scheduled for today. Complete new topics in your pathway to build your active recall deck.</p>
          </div>
          <button onClick={() => navigate('/roadmap')} className="px-6 h-10 bg-secondary text-white font-bold text-label-md rounded-lg shadow-md hover:bg-secondary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-base">explore</span>
            Study New Topics
          </button>
        </div>
      )}

      {/* <div className="tonal-card p-6 rounded-xl space-y-4 bg-white border border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-label-md text-label-md text-on-surface font-bold">Retention Mastery</span>
          <span className="font-label-sm text-label-sm text-primary font-bold">{overallMastery}% Overall</span>
        </div>
        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-indigo-400 h-full rounded-full shadow-sm transition-all duration-500" style={{ width: `${overallMastery}%` }} />
        </div>
        <div className="grid grid-cols-3 gap-2 pt-2">
          <MasteryStat label="Learned" value={learnedCount} tone="primary" />
          <MasteryStat label="Reviewing" value={reviewingCount} />
          <MasteryStat label="At Risk" value={atRiskCount} />
        </div>
      </div> */}

      <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined filled-icon text-yellow-400">stars</span>
            <span className="font-label-md text-label-md tracking-wider font-bold">PREMIUM GOAL</span>
          </div>
          <h4 className="font-headline-md text-headline-md leading-tight mb-2 font-bold">{targetRole} Certification Prep</h4>
          <p className="text-indigo-100 text-xs sm:text-sm mb-6 leading-relaxed">Complete your daily custom diagnostic drills today to stay on track for your {targetRole} path.</p>
          <button onClick={() => setShowDrillModal(true)} className="w-full py-3 bg-white text-indigo-900 rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-50 transition-colors shadow-md active:scale-95 duration-100 cursor-pointer">Start Drills</button>
        </div>
      </div>
    </div>
  </section>
);

const MasteryStat = ({ label, tone, value }) => (
  <div className="text-center">
    <p className={`font-headline-md text-headline-md ${tone === 'primary' ? 'text-primary' : 'text-on-surface'} font-black`}>{value}</p>
    <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">{label}</p>
  </div>
);

export default ActiveRecallSection;
