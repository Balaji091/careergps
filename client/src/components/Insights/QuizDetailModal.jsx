import React from 'react';

const QuizDetailModal = ({ quiz, onClose }) => {
  if (!quiz) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300">
        <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
          <h3 className="font-headline-md text-headline-md font-bold text-primary">Quiz Evaluation Report</h3>
          <button className="material-symbols-outlined hover:bg-surface-container-high p-1 rounded-full transition-all text-on-surface-variant cursor-pointer" onClick={onClose}>close</button>
        </div>
        <div className="p-6 space-y-4 text-sm">
          <ReportRow label="Quiz Name:" value={quiz.title} />
          <div className="flex justify-between items-center">
            <span className="font-bold text-on-surface-variant">Score Grade:</span>
            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-black">{quiz.score}%</span>
          </div>
          <ReportRow label="Correct Questions:" value={`${quiz.correct} / ${quiz.total}`} />
          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <button onClick={onClose} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer">Close Report</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="font-bold text-on-surface-variant">{label}</span>
    <span className="font-bold text-on-surface">{value}</span>
  </div>
);

export default QuizDetailModal;
