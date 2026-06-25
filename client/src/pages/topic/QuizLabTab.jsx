import React from 'react';

const QuizLabTab = ({
  quizQuestions,
  quizCompleted,
  quizSubmitted,
  quizScore,
  currentQuizIndex,
  setCurrentQuizIndex,
  selectedQuizOption,
  handleSelectQuizOption,
  handlePrevQuizQuestion,
  handleNextQuizQuestion,
  handleSubmitQuiz,
  quizAnswers
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {quizQuestions.length === 0 ? (
        <div className="bg-white border border-outline-variant/30 p-8 rounded-xl text-center text-xs text-on-surface-variant font-bold">
          No quiz questions generated for this topic yet.
        </div>
      ) : (
        <div className="bg-white border border-outline-variant/20 p-6 md:p-8 rounded-xl shadow-sm">
          {quizCompleted && quizSubmitted ? (
            <div className="p-6 rounded-xl border border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
              <h4 className="font-headline-md text-primary font-bold mb-2">Quiz Results</h4>
              <p className="text-on-surface-variant font-label-md font-semibold mb-4">
                Your Score: {quizScore} / {quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
              </p>
              {quizScore >= 3 ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                  <span className="material-symbols-outlined">verified</span>
                  <span>Passing score achieved! Topic mastered successfully. 🚀</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-error font-bold text-sm bg-error-container/10 border border-error/20 p-3 rounded-lg">
                  <span className="material-symbols-outlined">warning</span>
                  <span>Review study notes and try again to pass (needs 3/5 correct).</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="bg-primary/10 text-primary px-3.5 py-1 rounded-full font-label-sm font-bold">
                  {currentQuizIndex + 1}/{quizQuestions.length}
                </span>
                <span className="text-xs text-on-surface-variant font-bold">Passing Grade: 3/5 Correct</span>
              </div>

              <h4 className="font-headline-md text-headline-md font-bold text-on-surface mb-6 leading-snug">
                {quizQuestions[currentQuizIndex]?.question}
              </h4>

              <div className="grid grid-cols-1 gap-3 mb-6">
                {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all flex justify-between items-center cursor-pointer ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-primary scale-[1.01] shadow-sm' 
                          : 'border-outline-variant/25 hover:border-primary/50 bg-white text-on-surface'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-outline'
                      }`}>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevQuizQuestion}
                    disabled={currentQuizIndex === 0}
                    className="px-4 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold hover:bg-surface-container-low disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuizQuestion}
                    disabled={currentQuizIndex === quizQuestions.length - 1}
                    className="px-4 py-2 border border-outline-variant/30 rounded-lg text-xs font-bold hover:bg-surface-container-low disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>

                {currentQuizIndex === quizQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="px-6 py-2.5 bg-primary text-white hover:bg-primary-container font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase">
                    Answer all questions to submit
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizLabTab;
