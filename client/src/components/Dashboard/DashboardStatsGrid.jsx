import React from 'react';

const DashboardStatsGrid = ({
  analyticsStats,
  checklist,
  completedCount,
  modulesLeft,
  targetRole,
  toggleChecklistItem,
  user,
}) => (
  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
    <div className="bg-primary-container text-on-primary-container rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md">
      <div className="z-10">
        <span className="font-label-md text-label-md opacity-80 uppercase tracking-wider font-bold">Next Career Goal</span>
        <h4 className="font-headline-md text-headline-md mt-1 font-bold">{targetRole}</h4>
      </div>
      <div className="z-10">
        <div className="flex justify-between items-end mb-2">
          <span className="font-body-sm text-body-sm font-semibold">{modulesLeft} modules left</span>
          <span className="font-label-md text-label-md font-bold">{Math.round(analyticsStats.roadmapCompletion || 0)}% Path Completion</span>
        </div>
        <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
          <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${analyticsStats.roadmapCompletion || 0}%` }} />
        </div>
      </div>
      <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-9xl pointer-events-none select-none">trending_up</span>
    </div>

    <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg border border-indigo-900/50">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl -ml-8 -mb-8" />
      <div className="z-10 flex justify-between items-start">
        <div>
          <span className="font-label-md text-label-md text-indigo-200 uppercase tracking-widest font-black">Level Stats</span>
          <div className="flex items-center gap-2 mt-1">
            <h4 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
              Lvl {user?.level || 1}
            </h4>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Pro Builder</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
          <span className="material-symbols-outlined text-3xl font-black">sports_esports</span>
        </div>
      </div>
      <div className="z-10">
        <div className="flex justify-between items-end mb-1 text-xs font-bold text-indigo-200">
          <span>XP Progress</span>
          <span className="text-amber-300">{user?.xp || 0} / {(user?.level - 1) * 200 + 100} XP</span>
        </div>
        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
          <div
            className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            style={{ width: `${Math.min(((user?.xp || 0) / ((user?.level - 1) * 200 + 100)) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-indigo-300 mt-2 font-medium">Earn XP by completing topics, checklists, and focused drills!</p>
      </div>
    </div>

    <div className="bg-white border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between shadow-sm">
      <div>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Quiz Performance</span>
        <h4 className="font-headline-md text-headline-md mt-2 font-bold">Average Score: {Math.round(analyticsStats.averageQuizScore || 0)}%</h4>
        <p className="text-on-surface-variant text-body-sm font-medium">{analyticsStats.totalQuizzesTaken || 0} Quizzes Completed</p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined">analytics</span>
        <span className="font-label-sm text-label-sm font-bold">
          {analyticsStats.averageQuizScore >= 80 ? 'Above Average' : analyticsStats.averageQuizScore >= 50 ? 'Average' : 'Needs Study'}
        </span>
      </div>
    </div>

    <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">Daily Checklist</h4>
        <span className="font-label-sm text-label-sm text-primary font-bold">{completedCount}/{checklist.length} Done</span>
      </div>
      <ul className="space-y-3 flex-1 overflow-y-auto max-h-32 pr-1 custom-scrollbar">
        {checklist.length > 0 ? checklist.map((item) => {
          const isCompleted = item.status === 'Completed';
          return (
            <li
              key={item._id}
              onClick={() => toggleChecklistItem(item._id, item.status)}
              className="flex items-center gap-2.5 p-2 bg-surface-container-low rounded-lg group cursor-pointer hover:bg-surface-container transition-colors"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isCompleted ? 'bg-primary border-primary' : 'border-outline group-hover:border-primary'}`}>
                {isCompleted && <span className="material-symbols-outlined text-white text-[10px] font-black">check</span>}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className={`font-body-sm text-body-sm transition-all select-none font-bold truncate ${isCompleted ? 'text-on-surface-variant line-through font-normal' : 'text-on-surface'}`}>
                  {item.name}
                </span>
              </div>
            </li>
          );
        }) : (
          <p className="text-xs text-on-surface-variant italic py-3 text-center">No tasks today. Go to Planner to build!</p>
        )}
      </ul>
    </div>
  </div>
);

export default DashboardStatsGrid;
