import React from 'react';

const PlannerDrillModal = ({
  drillAnswers,
  drillEvaluation,
  drillSubmitted,
  dynamicDrill,
  onClose,
  onSubmit,
  setDrillAnswers,
  show,
  targetRole,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-5 sm:p-6 border-b border-outline-variant/30 flex justify-between items-center bg-indigo-900 text-white sticky top-0 z-10">
          <h3 className="font-headline-md flex items-center gap-2 font-bold text-base sm:text-lg">
            <span className="material-symbols-outlined text-yellow-400">stars</span>
            {dynamicDrill.modalTitle}
          </h3>
          <button className="material-symbols-outlined hover:bg-indigo-800 p-1 rounded-full transition-all text-white cursor-pointer" onClick={onClose}>close</button>
        </div>

        {/* Show evaluation results if available */}
        {drillEvaluation ? (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Score circle */}
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path className={drillEvaluation.score >= 70 ? 'text-emerald-500' : drillEvaluation.score >= 40 ? 'text-amber-500' : 'text-red-500'} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${drillEvaluation.score}, 100`} strokeLinecap="round" strokeWidth="3" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-black text-xl text-on-surface">{drillEvaluation.score}%</div>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-lg">{drillEvaluation.verdict}</h4>
                <p className="text-xs text-on-surface-variant font-semibold mt-1">+{drillEvaluation.xpAwarded || 0} XP earned</p>
              </div>
            </div>

            {/* Strengths */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/50">
              <h5 className="text-xs text-emerald-700 font-bold uppercase mb-1.5">💪 Strengths</h5>
              <p className="text-sm text-emerald-900 leading-relaxed">{drillEvaluation.strengths}</p>
            </div>

            {/* Improvements */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/50">
              <h5 className="text-xs text-amber-700 font-bold uppercase mb-1.5">📈 Areas to Improve</h5>
              <p className="text-sm text-amber-900 leading-relaxed">{drillEvaluation.improvements}</p>
            </div>

            <div className="flex gap-3 justify-end pt-3 border-t border-outline-variant/20">
              <button onClick={onClose} className="px-5 py-2.5 bg-indigo-900 text-white rounded-xl font-bold hover:bg-indigo-950 transition-all active:scale-95 shadow-md cursor-pointer">
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Questions form */
          <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
            <DrillQuestion
              label={`Question 1: ${dynamicDrill.q1}`}
              placeholder={dynamicDrill.q1Placeholder}
              value={drillAnswers.q1}
              onChange={(value) => setDrillAnswers(prev => ({ ...prev, q1: value }))}
            />
            <DrillQuestion
              label={`Question 2: ${dynamicDrill.q2}`}
              placeholder={dynamicDrill.q2Placeholder}
              value={drillAnswers.q2}
              onChange={(value) => setDrillAnswers(prev => ({ ...prev, q2: value }))}
            />
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
              <button type="button" onClick={onClose} className="px-5 py-2.5 border border-outline-variant/30 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-all cursor-pointer">Cancel</button>
              <button type="submit" disabled={drillSubmitted} className="bg-indigo-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-950 transition-all active:scale-95 shadow-md disabled:bg-slate-400 cursor-pointer">
                {drillSubmitted ? (
                  <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span><span>AI Evaluating...</span></>
                ) : (
                  <span>Submit {targetRole} Drills</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const DrillQuestion = ({ label, onChange, placeholder, value }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-on-surface">{label}</label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      placeholder={placeholder}
      className="w-full h-20 bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none font-body-md"
    />
  </div>
);

export default PlannerDrillModal;
