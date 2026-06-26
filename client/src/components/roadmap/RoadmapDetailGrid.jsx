import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoadmapDetailGrid = ({
  overallProgressPercent,
  completedTopics,
  totalTopics,
  dailyHours,
  experienceLevel,
  targetRole,
  targetTimeline
}) => {
  const navigate = useNavigate();

  // Dynamic Cognitive Load advice based on experience level
  const getCognitiveAdvice = () => {
    switch (experienceLevel?.toLowerCase()) {
      case 'beginner':
        return `Foundational roadmap active. Recommended study commitment: ${dailyHours}h / day. Pace yourself on core structural concepts.`;
      case 'advanced':
        return `Global architecture roadmap active. Recommended study commitment: ${dailyHours}h / day. Focus on low-latency scale strategies.`;
      case 'intermediate':
      default:
        return `Technical mastery roadmap active. Recommended study commitment: ${dailyHours}h / day. Focus on performance optimization and trade-offs.`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-16">
      {/* Progress Summary Card */}
      <div className="col-span-1 md:col-span-1 glass-card p-stack-lg rounded-xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-headline-md text-headline-md text-on-surface">Path Progress</h4>
          <span className="material-symbols-outlined text-primary">insights</span>
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-label-md text-on-surface-variant">Syllabus Completion</span>
              <span className="font-label-md text-primary font-bold">{overallProgressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${overallProgressPercent}%` }}></div>
            </div>
          </div>
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="font-body-sm text-primary leading-relaxed">
              You have mastered <strong>{completedTopics}</strong> out of <strong>{totalTopics}</strong> topics in this curriculum roadmap.
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div className="glass-card p-6 rounded-xl hover:shadow-md transition-shadow border border-outline-variant/30">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-secondary-container rounded-lg text-white">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h5 className="font-label-md text-label-md text-on-surface">Cognitive Load</h5>
              <p className="font-body-sm text-on-surface-variant leading-relaxed mt-1">
                {getCognitiveAdvice()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl hover:shadow-md transition-shadow border border-outline-variant/30">
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-surface-container-high rounded-lg text-primary">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <div>
              <h5 className="font-label-md text-label-md text-on-surface">Peer Benchmark</h5>
              <p className="font-body-sm text-on-surface-variant leading-relaxed mt-1">
                Based on your target of <strong>{targetTimeline}</strong> for <strong>{targetRole}</strong>, you are tracking well against similar career transitions in your cohort.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl hover:shadow-md transition-shadow col-span-1 md:col-span-2 border border-outline-variant/30">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div>
                <h5 className="font-label-md text-label-md text-on-surface">Daily Planner</h5>
                <p className="font-body-sm text-on-surface-variant">
                 Access your daily schedule, tasks, and learning goals.
                </p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/planner')} 
              className="px-4 py-2 bg-surface-container-high rounded-lg font-label-sm text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              Open Daily Planner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDetailGrid;
