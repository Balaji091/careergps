import React from 'react';

const DrillDetailModal = ({ drill, onClose }) => {
  if (!drill) return null;

  const score = drill.evaluation?.score || 0;
  const title = drill.focusTitle || drill.role || 'Practice Drill';

  return (
    <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low sticky top-0 z-10">
          <div>
            <h3 className="font-headline-md text-lg font-bold text-primary">Drill Evaluation Report</h3>
            <p className="text-xs text-on-surface-variant font-semibold">{title}</p>
          </div>
          <button className="material-symbols-outlined hover:bg-surface-container-high p-1 rounded-full transition-all text-on-surface-variant cursor-pointer" onClick={onClose}>close</button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Metric label="Score" value={`${score}%`} />
            <Metric label="XP" value={`+${drill.xpAwarded || 0}`} />
            <Metric label="Source" value={drill.source || 'general'} />
            <Metric label="Status" value={drill.evaluation?.verdict || 'Completed'} />
          </div>

          <FeedbackBlock title="Strengths" tone="emerald" value={drill.evaluation?.strengths || 'Good attempt.'} />
          <FeedbackBlock title="Areas to Improve" tone="amber" value={drill.evaluation?.improvements || 'Keep practicing.'} />

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Answers</h4>
            {(drill.questions || []).map((item, idx) => (
              <div key={`${drill._id}-q-${idx}`} className="p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
                <p className="font-bold text-on-surface mb-1">{idx + 1}. {item.question}</p>
                <p className="text-on-surface-variant leading-relaxed">{item.answer || 'No answer recorded.'}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-outline-variant/20">
            <button onClick={onClose} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer">Close Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
    <p className="text-[10px] uppercase font-black text-on-surface-variant">{label}</p>
    <p className="text-lg font-black text-on-surface capitalize">{value}</p>
  </div>
);

const FeedbackBlock = ({ title, tone, value }) => {
  const classes = tone === 'emerald'
    ? 'bg-emerald-50 border-emerald-200/50 text-emerald-900'
    : 'bg-amber-50 border-amber-200/50 text-amber-900';

  return (
    <div className={`p-4 rounded-xl border ${classes}`}>
      <h4 className="text-xs font-bold uppercase mb-1.5">{title}</h4>
      <p className="leading-relaxed">{value}</p>
    </div>
  );
};

export default DrillDetailModal;
