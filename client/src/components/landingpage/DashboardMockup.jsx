import React, { useState } from 'react';

const DashboardMockup = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'System Design Interview Mastery', checked: false },
    { id: 2, text: 'Contribute to Core Infrastructure', checked: false },
    { id: 3, text: 'Mentor 2 Junior Engineers', checked: false },
    { id: 4, text: 'Complete Distributed Systems Lab', checked: false },
  ]);

  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  const checkedCount = tasks.filter(t => t.checked).length;
  const totalTasks = tasks.length;
  const percentage = Math.round((checkedCount / totalTasks) * 100);

  // Readiness Score calculation: Base 50 + (checked tasks * 12)
  const score = Math.min(98, 50 + checkedCount * 12);

  // Circle Dashoffset (283 is full circle circumference for r=45)
  const dashoffset = 283 - (283 * score) / 100;

  return (
    <section id="product-mockup" className="scroll-mt-20 px-margin-mobile md:px-margin-desktop -mt-20">
      <div className="max-w-5xl mx-auto bg-surface-container-lowest border border-outline-variant/50 rounded-2xl shadow-2xl overflow-hidden glass-card">
        {/* Mockup Header */}
        <div className="h-12 bg-surface-container-high/50 flex items-center px-4 border-b border-outline-variant/20">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-error/20 border border-error/30"></div>
            <div className="w-3 h-3 rounded-full bg-secondary/20 border border-secondary/30"></div>
            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary/30"></div>
          </div>
          <div className="mx-auto bg-surface-container-low px-4 py-0.5 rounded text-[11px] font-mono text-outline">
            career-gps.app/dashboard
          </div>
        </div>

        <div className="grid grid-cols-12 min-h-[600px]">
          {/* Left Rail: Task List */}
          <div className="col-span-12 md:col-span-4 p-6 border-r border-outline-variant/20 bg-surface-container-lowest flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-[18px] mb-4 text-on-surface">Milestone: L5 Promotion</h3>
              <div className="space-y-4" id="task-list">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        task.checked
                          ? 'bg-primary border-primary'
                          : 'border-outline-variant group-hover:border-primary'
                      }`}
                    >
                      {task.checked && (
                        <span className="material-symbols-outlined text-[16px] text-on-primary">
                          check
                        </span>
                      )}
                    </div>
                    <span className="font-body-md text-on-surface text-sm">
                      {task.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-outline uppercase tracking-wider">
                  Overall Progress
                </span>
                <span className="text-xs font-bold text-primary">
                  {percentage}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Center: Readiness Gauge */}
          <div className="col-span-12 md:col-span-5 p-8 flex flex-col items-center justify-center bg-surface-container-low/30">
            <div className="relative w-64 h-64">
              {/* SVG Gauge */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container-high"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                ></circle>
                <circle
                  className="text-primary transition-all duration-1000 ease-in-out"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="45"
                  stroke="currentColor"
                  strokeDasharray="283"
                  strokeDashoffset={dashoffset}
                  strokeWidth="8"
                  style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline-xl text-headline-xl text-primary">
                  {score}
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  Readiness Score
                </span>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="font-body-md text-on-surface-variant italic">
                "You're trending 12% higher than average for Senior Engineer candidates this month."
              </p>
            </div>
          </div>

          {/* Right Rail: AI Chat Panel */}
          <div className="col-span-12 md:col-span-3 border-l border-outline-variant/20 flex flex-col bg-surface-container-lowest">
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-label-md text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Career Copilot
                </span>
              </div>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[400px]">
              <div className="bg-surface-container-high rounded-lg rounded-tl-none p-3 max-w-[90%]">
                <p className="text-xs font-body-md text-on-surface">
                  Based on your recent system design exercises, I recommend focusing on "Database Sharding" and "Consistency Models." Ready to dive in?
                </p>
              </div>
              <div className="bg-primary/10 rounded-lg rounded-tr-none p-3 ml-auto max-w-[90%] border border-primary/20">
                <p className="text-xs font-body-md text-on-surface">
                  Yes, show me a practice problem about global data replication.
                </p>
              </div>
              <div className="bg-surface-container-high rounded-lg rounded-tl-none p-3 max-w-[90%]">
                <p className="text-xs font-body-md text-on-surface">
                  Great choice. Let's design a distributed notification system for 10M users. What's your first step?
                </p>
              </div>
              <div className="shimmer h-12 w-3/4 rounded-lg rounded-tl-none p-3"></div>
            </div>
            <div className="p-4 border-t border-outline-variant/20">
              <div className="relative">
                <input
                  className="w-full bg-surface-container-low border-none rounded-lg text-xs py-3 pl-3 pr-10 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Ask your Career Copilot..."
                  type="text"
                  readOnly
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardMockup;
