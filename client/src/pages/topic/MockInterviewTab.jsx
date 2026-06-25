import React from 'react';

const MockInterviewTab = ({
  interviewQuestions,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  interviewAnswer,
  setInterviewAnswer,
  interviewConfidence,
  setInterviewConfidence,
  handleMockSubmit,
  interviewStatus,
  interviewEvaluation,
  reloadUserProfile
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {interviewQuestions.length === 0 ? (
        <div className="bg-white border border-outline-variant/30 p-8 rounded-xl text-center text-xs text-on-surface-variant font-bold">
          No interview questions generated for this topic yet.
        </div>
      ) : (
        <div className="bg-white border border-outline-variant/30 p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm font-bold">
              {currentQuestionIndex + 1}/{interviewQuestions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-on-surface-variant font-label-sm font-semibold">Confidence:</span>
              <select
                value={interviewConfidence}
                onChange={(e) => setInterviewConfidence(Number(e.target.value))}
                className="bg-surface-container-low border border-outline-variant/30 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary font-semibold cursor-pointer"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2 - Weak</option>
                <option value={3}>3 - Med</option>
                <option value={4}>4 - High</option>
                <option value={5}>5 - Expert</option>
              </select>
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-headline-md mb-4 text-on-surface leading-snug font-semibold">
            "{interviewQuestions[currentQuestionIndex]?.question}"
          </p>
          <textarea 
            value={interviewAnswer}
            onChange={(e) => setInterviewAnswer(e.target.value)}
            className="w-full h-28 sm:h-32 p-3 sm:p-4 bg-surface-container-low border border-outline-variant/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-xs sm:text-body-md" 
            placeholder="Type your strategic response here (focus on scalability, edge cases, CDNs, rate limiting)..."
          ></textarea>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  const prevIdx = currentQuestionIndex - 1;
                  setCurrentQuestionIndex(prevIdx);
                  setInterviewAnswer(interviewQuestions[prevIdx]?.answer || '');
                  setInterviewConfidence(interviewQuestions[prevIdx]?.confidence || 3);
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 border border-outline-variant/30 rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-surface-container-low disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentQuestionIndex === interviewQuestions.length - 1}
                onClick={() => {
                  const nextIdx = currentQuestionIndex + 1;
                  setCurrentQuestionIndex(nextIdx);
                  setInterviewAnswer(interviewQuestions[nextIdx]?.answer || '');
                  setInterviewConfidence(interviewQuestions[nextIdx]?.confidence || 3);
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 border border-outline-variant/30 rounded-lg text-[10px] sm:text-xs font-semibold hover:bg-surface-container-low disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
            
            <button 
              onClick={handleMockSubmit}
              disabled={interviewStatus === 'evaluating'}
              className="bg-primary text-white px-3 sm:px-6 h-9 sm:h-11 rounded-lg text-[11px] sm:text-xs md:text-label-md font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 sm:gap-2 shadow-md active:scale-95 duration-100 disabled:bg-slate-400 cursor-pointer"
            >
              <span>{interviewStatus === 'evaluating' ? 'Evaluating Answer...' : 'Submit Answer'}</span>
              <span className="material-symbols-outlined font-bold text-[16px] sm:text-[18px]">send</span>
            </button>
          </div>
        </div>
      )}

      {/* Evaluated Score Panel */}
      {interviewStatus === 'evaluated' && interviewEvaluation && (
        <div className="bg-secondary-container/5 border border-secondary/20 p-4 sm:p-6 rounded-xl relative overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[60px] sm:text-[80px]">smart_toy</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 mb-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-outline-variant/30" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeWidth="3"></path>
                <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${interviewEvaluation.score}, 100`} strokeLinecap="round" strokeWidth="3"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-base sm:text-xl text-primary">
                {interviewEvaluation.score}%
              </div>
            </div>
            <div>
              <h4 className="text-base sm:text-headline-md font-bold text-primary">AI Assessment Score</h4>
              <p className="text-on-surface-variant text-xs sm:text-label-md font-semibold">{interviewEvaluation.verdict}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 sm:p-4 bg-white rounded-lg border border-outline-variant/20 shadow-sm">
              <h5 className="text-[10px] sm:text-xs text-emerald-600 font-bold uppercase mb-1">Strengths</h5>
              <p className="text-xs sm:text-body-md text-on-surface leading-relaxed">{interviewEvaluation.strengths}</p>
            </div>
            <div className="p-3 sm:p-4 bg-white rounded-lg border border-outline-variant/20 shadow-sm">
              <h5 className="text-[10px] sm:text-xs text-primary font-bold uppercase mb-1">Areas of Development</h5>
              <p className="text-xs sm:text-body-md text-on-surface leading-relaxed">{interviewEvaluation.gaps}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewTab;
