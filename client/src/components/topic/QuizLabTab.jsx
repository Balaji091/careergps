import React from 'react';

const PASS_RATE = 0.6;
const ATTEMPTS_PER_PAGE = 3;

const QuizAnswerReview = ({ questions, answers }) => (
  <div className="space-y-3">
    {questions.map((question, questionIndex) => {
      const selectedIndex = answers[questionIndex];
      return (
        <div key={questionIndex} className="rounded-xl border border-outline-variant/25 bg-white p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {questionIndex + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-snug text-on-surface">{question.question}</p>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {question.options.map((option, optionIndex) => {
                  const isCorrect = optionIndex === question.correctIndex;
                  const isSelected = selectedIndex === optionIndex;
                  return (
                    <div
                      key={optionIndex}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold leading-relaxed ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : isSelected
                            ? 'border-error/30 bg-error-container/10 text-error'
                            : 'border-outline-variant/20 bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span>{option}</span>
                        {isCorrect && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                        {isSelected && !isCorrect && <span className="material-symbols-outlined text-[16px]">cancel</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {question.explanation && (
                <p className="mt-3 rounded-lg bg-primary/5 p-3 text-xs font-medium leading-relaxed text-on-surface-variant">
                  {question.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const QuizAttempts = ({ attempts, quizAttemptPage, setQuizAttemptPage }) => {
  if (attempts.length <= 1) return null;

  const totalPages = Math.max(1, Math.ceil(attempts.length / ATTEMPTS_PER_PAGE));
  const start = (quizAttemptPage - 1) * ATTEMPTS_PER_PAGE;
  const visibleAttempts = attempts.slice(start, start + ATTEMPTS_PER_PAGE);
  const bestAttempt = attempts.reduce((best, attempt) => (
    attempt.score / attempt.totalQuestions > best.score / best.totalQuestions ? attempt : best
  ), attempts[0]);
  const bestPercent = Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100);

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/20 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-outline-variant/15 bg-surface-container-low/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-bold text-on-surface">Attempt History</h4>
          <p className="mt-0.5 text-xs font-semibold text-on-surface-variant">
            {attempts.length} attempts · Best {bestPercent}%
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            disabled={quizAttemptPage === 1}
            onClick={() => setQuizAttemptPage(prev => Math.max(1, prev - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface transition-colors hover:bg-white disabled:opacity-40"
            aria-label="Previous attempts page"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <span className="min-w-12 text-center text-xs font-bold text-on-surface-variant">
            {quizAttemptPage}/{totalPages}
          </span>
          <button
            type="button"
            disabled={quizAttemptPage === totalPages}
            onClick={() => setQuizAttemptPage(prev => Math.min(totalPages, prev + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface transition-colors hover:bg-white disabled:opacity-40"
            aria-label="Next attempts page"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-outline-variant/15">
        {visibleAttempts.map((attempt, index) => {
          const attemptNumber = attempts.length - (start + index);
          const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
          const attemptDate = new Date(attempt.createdAt);
          const isLatest = start + index === 0;
          return (
            <div key={attempt._id} className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-on-surface">Attempt {attemptNumber}</p>
                  {isLatest && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                      Latest
                    </span>
                  )}
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                    attempt.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-error-container/10 text-error'
                  }`}>
                    {attempt.passed ? 'Pass' : 'Fail'}
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-on-surface-variant">
                  {attemptDate.toLocaleDateString()} · {attemptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-outline-variant/20">
                  <div
                    className={`h-full rounded-full ${attempt.passed ? 'bg-emerald-500' : 'bg-error'}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <div className="flex items-end justify-between gap-4 sm:flex-col sm:items-end">
                <p className="text-xs font-bold uppercase text-on-surface-variant">Score</p>
                <p className="text-lg font-extrabold text-on-surface">
                  {attempt.score}<span className="text-xs font-bold text-on-surface-variant">/{attempt.totalQuestions}</span>
                </p>
                <p className="text-xs font-bold text-on-surface-variant">{percent}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuizLabTab = ({
  quizQuestions,
  quizCompleted,
  quizSubmitted,
  quizScore,
  quizPassed,
  currentQuizIndex,
  selectedQuizOption,
  handleSelectQuizOption,
  handlePrevQuizQuestion,
  handleNextQuizQuestion,
  handleSubmitQuiz,
  handleRetryQuiz,
  quizAnswers,
  showQuizAnswers,
  setShowQuizAnswers,
  quizAttempts,
  quizAttemptPage,
  setQuizAttemptPage
}) => {
  const passMark = Math.ceil(quizQuestions.length * PASS_RATE);
  const answeredCount = Object.keys(quizAnswers).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {quizQuestions.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/30 bg-white p-8 text-center text-xs font-bold text-on-surface-variant">
          No quiz questions generated for this topic yet.
        </div>
      ) : (
        <div className="rounded-xl border border-outline-variant/20 bg-white p-4 shadow-sm sm:p-6 md:p-8">
          {quizCompleted && quizSubmitted ? (
            <div className="space-y-5">
              <div className={`rounded-xl border p-5 animate-in slide-in-from-top-4 duration-300 ${
                quizPassed ? 'border-emerald-200 bg-emerald-50' : 'border-error/20 bg-error-container/10'
              }`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className={`font-headline-md text-lg font-bold ${quizPassed ? 'text-emerald-700' : 'text-error'}`}>
                      {quizPassed ? 'Quiz Passed' : 'Quiz Failed'}
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-on-surface-variant">
                      Score: {quizScore}/{quizQuestions.length} ({Math.round((quizScore / quizQuestions.length) * 100)}%)
                    </p>
                    <p className="mt-1 text-xs font-semibold text-on-surface-variant">
                      Passing score: {passMark}/{quizQuestions.length}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRetryQuiz}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-container active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[16px]">replay</span>
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuizAnswers(prev => !prev)}
                      className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-white px-4 py-2 text-xs font-bold text-on-surface transition-all hover:bg-surface-container-low"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      {showQuizAnswers ? 'Hide Answers' : 'Reveal Answers'}
                    </button>
                  </div>
                </div>
              </div>

              {showQuizAnswers && (
                <QuizAnswerReview questions={quizQuestions} answers={quizAnswers} />
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="w-fit rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                  {currentQuizIndex + 1}/{quizQuestions.length}
                </span>
                <span className="text-[11px] font-bold text-on-surface-variant sm:text-xs">
                  Passing Grade: {passMark}/{quizQuestions.length} Correct
                </span>
              </div>

              <h4 className="mb-6 text-base font-bold leading-snug text-on-surface sm:text-lg md:text-headline-md">
                {quizQuestions[currentQuizIndex]?.question}
              </h4>

              <div className="mb-6 grid grid-cols-1 gap-3">
                {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                  const isSelected = selectedQuizOption === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 text-left text-xs font-semibold transition-all sm:p-4 sm:text-sm ${
                        isSelected
                          ? 'scale-[1.01] border-primary bg-primary/5 text-primary shadow-sm'
                          : 'border-outline-variant/25 bg-white text-on-surface hover:border-primary/50'
                      }`}
                    >
                      <span className="min-w-0 leading-relaxed">{option}</span>
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected ? 'border-primary bg-primary' : 'border-outline'
                      }`}>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white"></span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 border-t border-outline-variant/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevQuizQuestion}
                    disabled={currentQuizIndex === 0}
                    className="cursor-pointer rounded-lg border border-outline-variant/30 px-4 py-2 text-xs font-bold transition-colors hover:bg-surface-container-low disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuizQuestion}
                    disabled={currentQuizIndex === quizQuestions.length - 1}
                    className="cursor-pointer rounded-lg border border-outline-variant/30 px-4 py-2 text-xs font-bold transition-colors hover:bg-surface-container-low disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>

                {currentQuizIndex === quizQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={answeredCount < quizQuestions.length}
                    className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-container active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <span className="text-[9px] font-bold uppercase text-on-surface-variant/60 sm:text-[10px]">
                    Answer all questions to submit
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <QuizAttempts
        attempts={quizAttempts}
        quizAttemptPage={quizAttemptPage}
        setQuizAttemptPage={setQuizAttemptPage}
      />
    </div>
  );
};

export default QuizLabTab;
