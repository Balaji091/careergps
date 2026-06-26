import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoadmapTimeline = ({ subjects }) => {
  const navigate = useNavigate();

  // Dynamic width: step distance decreases as subjects count increases
  const timelineWidth = Math.max(1000, 800 + subjects.length * 80);

  const getSvgPath = () => {
    if (subjects.length <= 1) return `M0 100 H${timelineWidth}`;
    const step = timelineWidth / (subjects.length - 1);
    let path = "M0 100";
    for (let i = 0; i < subjects.length; i++) {
      const x = i * step;
      const y = i % 2 === 0 ? 30 : 170;
      if (i === 0) {
        path = `M${x} ${y}`;
      } else {
        const prevX = (i - 1) * step;
        const prevY = (i - 1) % 2 === 0 ? 30 : 170;
        const cpX1 = prevX + step / 2;
        const cpY1 = prevY;
        const cpX2 = prevX + step / 2;
        const cpY2 = y;
        path += ` C${cpX1} ${cpY1} ${cpX2} ${cpY2} ${x} ${y}`;
      }
    }
    return path;
  };

  const roadmapNodes = subjects.map((subj, idx) => {
    let nodeStatus = 'not_started';
    if (subj.status === 'completed') {
      nodeStatus = 'completed';
    } else if (subj.status === 'in_progress' || subj.status === 'in-progress' || subj.progress > 0) {
      nodeStatus = 'in-progress';
    } else if (idx === subjects.length - 1) {
      nodeStatus = 'goal';
    }

    const icon = nodeStatus === 'completed' 
      ? 'check_circle' 
      : (nodeStatus === 'in-progress' ? 'terminal' : (nodeStatus === 'goal' ? 'flag' : 'school'));

    return {
      id: subj._id,
      title: subj.name,
      difficulty: subj.estimatedTime || '10 days',
      status: nodeStatus,
      icon: icon,
      progress: subj.progress || 0,
    };
  });

  return (
    <div className="relative overflow-x-auto pb-12 no-scrollbar bg-surface-container-lowest/30 rounded-2xl border border-outline-variant/20 p-4">
      {/* Timeline Container with dynamic width */}
      <div className="py-20 px-10 relative" style={{ width: `${timelineWidth}px` }}>
        {/* Connecting SVG Path (Background) */}
        <svg 
          className="absolute top-1/2 left-0 -translate-y-1/2 h-64 pointer-events-none" 
          fill="none" 
          viewBox={`0 0 ${timelineWidth} 200`} 
          style={{ width: `${timelineWidth}px` }} 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={getSvgPath()}
            stroke="url(#gradient-line)"
            strokeDasharray="12 8"
            strokeWidth="4"
          ></path>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="gradient-line" x1="0" x2={timelineWidth} y1="100" y2="100">
              <stop stopColor="#2a14b4"></stop>
              <stop offset="1" stopColor="#4648d4"></stop>
            </linearGradient>
          </defs>
        </svg>

        {/* Dynamic Nodes Grid */}
        <div className="flex justify-between items-center relative z-10">
          {roadmapNodes.map((node, idx) => {
            const yOffset = idx % 2 === 0 ? '-translate-y-20' : 'translate-y-20';
            
            if (node.status === 'completed') {
              return (
                <div key={node.id} onClick={() => navigate(`/subject/${node.id}`)} className={`flex flex-col items-center gap-6 ${yOffset} group cursor-pointer`}>
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full glass-card flex items-center justify-center shadow-md border-2 border-emerald-500 relative transition-transform group-hover:scale-105">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="64" cy="64" fill="transparent" r="58" stroke="#f1f5f9" strokeWidth="6"></circle>
                        <circle cx="64" cy="64" fill="transparent" r="58" stroke="#10b981" strokeDasharray="364" strokeDashoffset="0" strokeWidth="6"></circle>
                      </svg>
                      <span className="material-symbols-outlined text-emerald-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {node.icon}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block font-label-sm text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-1 font-bold">
                      {node.difficulty} • Mastered
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                      {node.title}
                    </h3>
                  </div>
                </div>
              );
            }

            if (node.status === 'in-progress') {
              const circumference = 452.389;
              const dashoffset = circumference - (circumference * node.progress) / 100;
              
              return (
                <div key={node.id} onClick={() => navigate(`/subject/${node.id}`)} className={`flex flex-col items-center gap-6 ${yOffset} group cursor-pointer`}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl node-pulse"></div>
                    <div className="w-40 h-40 rounded-full bg-white flex items-center justify-center shadow-xl border-4 border-amber-500 relative transition-transform group-hover:scale-105">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="80" cy="80" fill="transparent" r="72" stroke="#f1f5f9" strokeWidth="8"></circle>
                        <circle cx="80" cy="80" fill="transparent" r="72" stroke="#f59e0b" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeWidth="8"></circle>
                      </svg>
                      <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-amber-500 text-5xl">{node.icon}</span>
                        <span className="font-label-sm text-amber-600 font-bold mt-1">{node.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block font-label-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-1 font-bold animate-pulse">
                      {node.difficulty} • Ongoing
                    </span>
                    <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                      {node.title}
                    </h3>
                  </div>
                </div>
              );
            }

            // not_started / goal (fully clickable, similar color theme, no lock!)
            return (
              <div key={node.id} onClick={() => navigate(`/subject/${node.id}`)} className={`flex flex-col items-center gap-6 ${yOffset} group cursor-pointer`}>
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-surface-container-low flex items-center justify-center shadow-sm border border-outline-variant/60 relative transition-transform group-hover:scale-105">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 opacity-20">
                      <circle cx="64" cy="64" fill="transparent" r="58" stroke="#c7c4d7" strokeWidth="6"></circle>
                    </svg>
                    <span className="material-symbols-outlined text-on-surface-variant text-4xl">{node.icon}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="block font-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full mb-1">
                    {node.difficulty} • Not Started
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                    {node.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
