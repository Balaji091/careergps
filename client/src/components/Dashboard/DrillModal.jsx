import React from 'react';

const DrillModal = ({
  drillAnswer,
  drillSuccess,
  focusAreas,
  onClose,
  onSubmit,
  setDrillAnswer,
  show,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-primary text-white">
          <h3 className="font-headline-md flex items-center gap-2 font-bold">
            <span className="material-symbols-outlined text-white">auto_awesome</span>
            AI Recommended Diagnostic Drill
          </h3>
          <button className="material-symbols-outlined hover:bg-primary-container p-1 rounded-full transition-all text-white cursor-pointer" onClick={onClose}>
            close
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4 text-left">
          <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
            Focus Skill: <span className="text-primary">{focusAreas[0]?.title}</span>
            <br />
            <span className="text-xs text-outline italic font-normal">
              Challenge: Briefly write down the consistency trade-offs of SAGAS vs 2PC for {focusAreas[0]?.title}.
            </span>
          </p>
          <textarea
            value={drillAnswer}
            onChange={(e) => setDrillAnswer(e.target.value)}
            required
            className="w-full h-24 bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none font-body-md"
            placeholder="Type your engineering explanation..."
          />
          <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-outline-variant/30 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-all cursor-pointer text-sm">
              Cancel
            </button>
            <button type="submit" disabled={drillSuccess} className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer text-sm disabled:cursor-not-allowed disabled:bg-slate-400">
              {drillSuccess ? 'Submitting...' : 'Submit Drill Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DrillModal;
