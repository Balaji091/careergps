import React from 'react';

const SubjectCurriculum = ({
  curriculum,
  openAccordionIds,
  toggleAccordion,
  fetchSubjectData,
  navigate
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
      {/* Curriculum Header */}
      <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/30">
        <h3 className="font-headline-md text-headline-md text-on-surface">Curriculum</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => fetchSubjectData(true)}
            className="p-1.5 hover:bg-surface-container-high rounded-md transition-colors text-on-surface-variant flex items-center justify-center"
            title="Refresh Curriculum"
          >
            <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
          </button>
        </div>
      </div>

      {/* Curriculum Accordion List */}
      <div className="divide-y divide-outline-variant/10">
        {curriculum.map((item) => {
          const isOpen = openAccordionIds.includes(item.id);
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in-progress';
          const isLocked = item.status === 'locked';

          return (
            <div key={item.id} className="group">
              <div 
                onClick={() => !isLocked && toggleAccordion(item.id)}
                className={`flex items-center justify-between p-6 transition-colors select-none ${
                  isLocked 
                    ? 'cursor-not-allowed opacity-60' 
                    : 'cursor-pointer hover:bg-surface-container/30'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Circle Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isLocked 
                      ? 'bg-slate-100 border-slate-300 text-slate-400' 
                      : isCompleted 
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                      : isInProgress
                      ? 'bg-amber-500/10 border-amber-500 text-amber-600 animate-pulse'
                      : 'bg-surface-container border-outline text-on-surface-variant'
                  }`}>
                    {isLocked ? (
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                    ) : isCompleted ? (
                      <span className="material-symbols-outlined text-[16px] font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: (isCompleted || isInProgress) ? "'FILL' 1" : undefined }}>
                        school
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className={`font-bold text-sm leading-snug ${isLocked ? 'text-on-surface-variant/50' : 'text-on-surface'}`}>
                      {item.title}
                    </h4>
                    <div className="flex gap-2.5 items-center mt-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                      <span>{item.duration}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] ${
                        item.type === 'Advanced' 
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed' 
                          : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!isLocked && (
                    <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}>
                      expand_more
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Accordion Drawer */}
              {isOpen && !isLocked && (
                <div className="px-6 pb-6 pt-1 bg-surface-container-low/20 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 bg-white rounded-xl border border-outline-variant/20 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                        <span className="material-symbols-outlined text-[14px]">science</span>
                        <span>Interactive Workspace Lab</span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        Engage in tutor lessons, complete practice simulators, review notes, and pass the evaluation quiz.
                      </p>
                    </div>

                    <button 
                      onClick={() => navigate(`/topic/${item.id}`)}
                      className="px-5 h-[36px] bg-primary text-white hover:bg-primary-container rounded-lg font-label-md text-xs font-bold flex items-center gap-2 shadow transition-all active:scale-95 duration-100 shrink-0 cursor-pointer"
                    >
                      <span>Launch Workspace</span>
                      <span className="material-symbols-outlined text-[16px]">launch</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectCurriculum;
