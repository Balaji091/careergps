import React from 'react';

const InsightsHeaderSummary = ({ analyticsStats, navigate, timelineNodes }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
    {/* Left — Path Milestones */}
    <section className="lg:col-span-2 bg-white p-4 md:p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
          <div>
            <h3 className="font-headline-md text-lg md:text-xl text-on-surface font-bold">Path Milestones</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Your engineered curriculum milestones timeline</p>
          </div>
          <button onClick={() => navigate('/roadmap')} className="text-primary font-bold text-label-md hover:underline cursor-pointer">View Roadmap</button>
        </div>
        <div className="space-y-4 relative pl-5 border-l-2 border-slate-100 ml-3">
          {timelineNodes.map((node, idx) => {
            const badgeColor = node.status === 'Mastered' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-primary/5 text-primary border-primary/20';
            return (
              <div key={idx} className="relative">
                <div className={`absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full border-4 border-white shadow-sm ${node.colorClass}`} />
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h4 className={`font-label-md ${node.textClass}`}>{node.name}</h4>
                    <p className="text-body-sm text-on-surface-variant">{node.label}</p>
                    {node.status === 'Current' && (
                      <div className="mt-2 w-48 sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${node.progress}%` }} />
                      </div>
                    )}
                  </div>
                  <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>{node.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Right — Stat Cards Grid (2x3 tight) */}
    <div className="lg:col-span-1 grid grid-cols-2 gap-3.5 content-start">
      <SummaryMetric
        label="Total Quizzes"
        value={analyticsStats.totalQuizzesTaken || 0}
        icon="fact_check"
        color="text-primary bg-primary/10"
      />
      <SummaryMetric
        label="Avg Score"
        value={`${Math.round(analyticsStats.averageQuizScore || 0)}%`}
        icon="grade"
        color="text-secondary bg-secondary/10"
      />
      <SummaryMetric
        label="Interview Q/A"
        value={`${Math.round(analyticsStats.interviewQuestionsCompleted || 0)}`}
        icon="record_voice_over"
        color="text-violet-600 bg-violet-50"
      />
      <SummaryMetric
        label="Interview Avg"
        value={`${Math.round(analyticsStats.interviewPerformanceAvg || 0)}%`}
        icon="psychology"
        color="text-emerald-600 bg-emerald-50"
      />
      <SummaryMetric
        label="Drills Attended"
        value={analyticsStats.totalDrillsAttended || 0}
        icon="assignment_turned_in"
        color="text-cyan-600 bg-cyan-50"
      />
      <SummaryMetric
        label="Drill Avg"
        value={`${Math.round(analyticsStats.averageDrillScore || 0)}%`}
        icon="speed"
        color="text-fuchsia-600 bg-fuchsia-50"
      />
      <SummaryMetric
        label="Consistency"
        value={`${Math.round(analyticsStats.consistencyScore || 0)}%`}
        icon="trending_up"
        color="text-amber-600 bg-amber-50"
      />
      <SummaryMetric
        label="Best Streak"
        value={`${analyticsStats.longestStreak || 0}d`}
        icon="local_fire_department"
        color="text-rose-600 bg-rose-50"
      />
    </div>
  </div>
);

const SummaryMetric = ({ color, icon, label, value }) => (
  <div className="min-h-[70px] bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-default group">
    <div className="flex justify-between items-start gap-1.5 mb-1">
      <span className="text-[8px] text-on-surface-variant uppercase tracking-wide font-bold leading-tight">{label}</span>
      <div className={`${color} p-0.5 rounded-md transition-colors shrink-0`}>
        <span className="material-symbols-outlined text-[13px]">{icon}</span>
      </div>
    </div>
    <p className="text-lg sm:text-xl text-on-surface font-black leading-none">{value}</p>
  </div>
);

export default InsightsHeaderSummary;
