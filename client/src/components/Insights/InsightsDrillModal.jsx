import React from 'react';

const InsightsDrillModal = ({
  drillAnswer,
  drillEvaluation,
  drillSubmitting,
  focusTitle,
  onClose,
  onSubmit,
  setDrillAnswer,
  show,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-primary text-white sticky top-0 z-10">
          <h3 className="font-headline-md flex items-center gap-2 font-bold text-base sm:text-lg">
            <span className="material-symbols-outlined text-white">auto_awesome</span>
            AI Diagnostic Drill
          </h3>
          <button className="material-symbols-outlined hover:bg-primary-container p-1 rounded-full transition-all text-white cursor-pointer" onClick={onClose}>close</button>
        </div>

        {drillEvaluation ? (
          <div className="p-5 sm:p-6 space-y-5">
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
            <FeedbackBlock title="Strengths" tone="emerald" value={drillEvaluation.strengths} />
            <FeedbackBlock title="Areas to Improve" tone="amber" value={drillEvaluation.improvements} />
            <div className="flex justify-end pt-3 border-t border-outline-variant/20">
              <button onClick={onClose} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer">Done</button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
            <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
              Focus Skill: <strong className="text-on-surface">{focusTitle}</strong>
            </p>
            <p className="text-sm text-on-surface font-medium leading-relaxed">
              Explain the key trade-offs and production risks for <strong>{focusTitle}</strong>.
            </p>
            <textarea
              value={drillAnswer}
              onChange={(e) => setDrillAnswer(e.target.value)}
              required
              className="w-full h-28 bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none font-body-md"
              placeholder="Type your engineering explanation..."
            />
            <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
              <button type="button" onClick={onClose} className="px-5 py-2.5 border border-outline-variant/30 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-all cursor-pointer">Cancel</button>
              <button type="submit" disabled={drillSubmitting} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer disabled:bg-slate-400">
                {drillSubmitting ? (
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>AI Evaluating...</span>
                ) : 'Submit Answer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const FeedbackBlock = ({ title, tone, value }) => {
  const classes = tone === 'emerald'
    ? 'bg-emerald-50 border-emerald-200/50 text-emerald-900'
    : 'bg-amber-50 border-amber-200/50 text-amber-900';

  return (
    <div className={`p-4 rounded-xl border ${classes}`}>
      <h5 className="text-xs font-bold uppercase mb-1.5">{title}</h5>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
};

export default InsightsDrillModal;
