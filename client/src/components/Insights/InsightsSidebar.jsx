import React from 'react';

const InsightsSidebar = ({
  displayedQuizzes,
  drillPage,
  drillTotalPages,
  growthSkills,
  navigate,
  recentDrills,
  setDrillPage,
  setSelectedDrillDetails,
  setSelectedQuizDetails,
  setShowAllQuizzes,
  showAllQuizzes,
  strongestSkills,
}) => (
  <div className="space-y-gutter">
    <section className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
      <h3 className="font-headline-md text-headline-md mb-6 font-bold">Skills Analysis</h3>
      <div className="space-y-6">
        <SkillGroup emptyText="No subjects mastered yet. Keep studying!" items={strongestSkills} label="Strongest Modules" tone="emerald" />
        <SkillGroup emptyText="No pending growth modules." items={growthSkills} label="Growth Needed" tone="primary" />
      </div>
    </section>

    <section className="bg-white p-5 rounded-xl border border-outline-variant/20 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline-md text-lg font-bold">Recent Drills</h3>
        <span className="text-[10px] uppercase font-black text-on-surface-variant">Page {drillPage}/{drillTotalPages}</span>
      </div>
      <div className="space-y-2">
        {recentDrills.length > 0 ? (
          <>
            {recentDrills.map((drill) => {
              const score = drill.evaluation?.score || 0;
              const title = drill.focusTitle || drill.role || 'Practice Drill';
              return (
                <div key={drill._id} onClick={() => setSelectedDrillDetails(drill)} className="flex items-center gap-3 p-3 hover:bg-surface-container rounded-xl transition-colors cursor-pointer group">
                  <div className={`w-11 h-11 flex items-center justify-center rounded-xl shrink-0 transition-colors font-bold ${
                    score >= 70 ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                  }`}>
                    <span>{score}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-label-md text-on-surface truncate font-semibold">{title}</h4>
                    <p className="text-[11px] text-on-surface-variant uppercase font-black">{new Date(drill.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-on-surface transition-colors">chevron_right</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                onClick={() => setDrillPage(prev => Math.max(1, prev - 1))}
                disabled={drillPage === 1}
                className="px-3 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setDrillPage(prev => Math.min(drillTotalPages, prev + 1))}
                disabled={drillPage === drillTotalPages}
                className="px-3 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-container transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="py-6 px-4 text-center border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20">
            <span className="material-symbols-outlined text-primary text-2xl">psychology_alt</span>
            <h4 className="text-sm font-bold text-on-surface mt-2">No drills completed yet</h4>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">Complete a diagnostic drill to see scores and feedback here.</p>
          </div>
        )}
      </div>
    </section>

    <section className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-headline-md text-headline-md font-bold">Recent Quizzes</h3>
      </div>
      <div className="space-y-2">
        {displayedQuizzes.length > 0 ? (
          <>
            {displayedQuizzes.map((quiz, idx) => (
              <div key={quiz.id || idx} onClick={() => setSelectedQuizDetails(quiz)} className="flex items-center gap-4 p-3 hover:bg-surface-container rounded-xl transition-colors cursor-pointer group">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 transition-colors font-bold ${
                  quiz.score >= 90 ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                }`}>
                  <span>{quiz.score}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-label-md text-on-surface truncate font-semibold">{quiz.title}</h4>
                  <p className="text-[11px] text-on-surface-variant uppercase font-black">{quiz.date}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-on-surface transition-colors">chevron_right</span>
              </div>
            ))}
            <button onClick={() => setShowAllQuizzes(!showAllQuizzes)} className="w-full mt-6 py-3 border border-outline-variant/30 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-label-md cursor-pointer">
              {showAllQuizzes ? 'Show Less Activities' : 'Show All Activities'}
            </button>
          </>
        ) : (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20 animate-in fade-in duration-300">
            <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
              <span className="material-symbols-outlined text-2xl animate-pulse">school</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-on-surface">No quizzes completed yet</h4>
              <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">Complete subjects in your pathway to unlock topic quizzes and view your detailed analytics here.</p>
            </div>
            <button onClick={() => navigate('/roadmap')} className="px-6 h-10 bg-primary text-on-primary font-bold text-label-md rounded-lg shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-base">explore</span>
              Go to Syllabus Path
            </button>
          </div>
        )}
      </div>
    </section>
  </div>
);

const SkillGroup = ({ emptyText, items, label, tone }) => {
  const valueClass = tone === 'emerald' ? 'text-emerald-600' : 'text-primary';
  const barClass = tone === 'emerald' ? 'bg-emerald-500' : 'bg-primary';

  return (
    <div>
      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">{label}</h4>
      <div className="space-y-4">
        {items.length > 0 ? items.map((skill) => (
          <div key={skill._id} className="space-y-1.5">
            <div className="flex justify-between text-label-sm font-semibold">
              <span>{skill.name}</span>
              <span className={`${valueClass} font-bold`}>{skill.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${barClass} rounded-full`} style={{ width: `${skill.progress}%` }} />
            </div>
          </div>
        )) : (
          <p className="text-xs text-on-surface-variant italic">{emptyText}</p>
        )}
      </div>
    </div>
  );
};

export default InsightsSidebar;
