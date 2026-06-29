import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoadmapTimeline = ({ subjects }) => {
  const navigate = useNavigate();
  const nodeCount = subjects.length;
  const density = nodeCount >= 12 ? 'compact' : nodeCount >= 9 ? 'dense' : 'normal';
  const nodeSize = density === 'compact' ? 86 : density === 'dense' ? 104 : 128;
  const activeNodeSize = density === 'compact' ? 104 : density === 'dense' ? 124 : 160;
  const labelWidth = density === 'compact' ? 112 : density === 'dense' ? 136 : 176;
  const titleClass = density === 'compact'
    ? 'text-[11px] leading-tight'
    : density === 'dense'
      ? 'text-xs leading-tight'
      : 'text-sm leading-snug';
  const metaClass = density === 'compact' ? 'text-[9px]' : 'text-[10px]';
  const iconClass = density === 'compact' ? 'text-3xl' : 'text-4xl';
  const timelineWidth = Math.max(920, 220 + nodeCount * (density === 'compact' ? 118 : density === 'dense' ? 142 : 176));
  const svgHeight = density === 'compact' ? 260 : 300;
  const centerY = svgHeight / 2;
  const laneOffset = density === 'compact' ? 66 : 78;

  const getSvgPath = () => {
    if (nodeCount <= 1) return `M0 ${centerY} H${timelineWidth}`;
    const step = timelineWidth / (nodeCount - 1);
    let path = `M0 ${centerY}`;

    for (let i = 0; i < nodeCount; i++) {
      const x = i * step;
      const y = i % 2 === 0 ? centerY - laneOffset : centerY + laneOffset;
      if (i === 0) {
        path = `M${x} ${y}`;
      } else {
        const prevX = (i - 1) * step;
        const prevY = (i - 1) % 2 === 0 ? centerY - laneOffset : centerY + laneOffset;
        path += ` C${prevX + step / 2} ${prevY} ${prevX + step / 2} ${y} ${x} ${y}`;
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
      : nodeStatus === 'in-progress'
        ? 'terminal'
        : nodeStatus === 'goal'
          ? 'flag'
          : 'school';

    return {
      id: subj._id,
      title: subj.name,
      difficulty: subj.estimatedTime || '10 days',
      status: nodeStatus,
      icon,
      progress: subj.progress || 0,
    };
  });

  const renderLabel = (node, tone, isTop) => {
    const toneClasses = {
      completed: 'bg-emerald-50 text-emerald-600',
      active: 'bg-amber-50 text-amber-600 animate-pulse',
      idle: 'bg-surface-container text-on-surface-variant',
    };
    const statusText = tone === 'completed' ? 'Mastered' : tone === 'active' ? 'Ongoing' : 'Not Started';

    return (
      <div className={`${isTop ? 'order-first mb-3' : 'order-last mt-3'} text-center`} style={{ width: `${labelWidth}px` }}>
        <span className={`mb-1 block rounded-full px-2 py-0.5 font-bold ${metaClass} ${toneClasses[tone]}`}>
          {node.difficulty} &bull; {statusText}
        </span>
        <h3 className={`font-bold text-on-surface transition-colors group-hover:text-primary ${titleClass}`}>
          {node.title}
        </h3>
      </div>
    );
  };

  const renderNodeCircle = (node) => {
    if (node.status === 'in-progress') {
      const circumference = 452.389;
      const dashoffset = circumference - (circumference * node.progress) / 100;
      const center = activeNodeSize / 2;
      const radius = activeNodeSize / 2 - 8;

      return (
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl node-pulse" />
          <div
            className="relative flex items-center justify-center rounded-full border-4 border-amber-500 bg-white shadow-xl transition-transform group-hover:scale-105"
            style={{ width: `${activeNodeSize}px`, height: `${activeNodeSize}px` }}
          >
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx={center} cy={center} fill="transparent" r={radius} stroke="#f1f5f9" strokeWidth="8" />
              <circle cx={center} cy={center} fill="transparent" r={radius} stroke="#f59e0b" strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeWidth="8" />
            </svg>
            <div className="flex flex-col items-center">
              <span className={`material-symbols-outlined text-amber-500 ${iconClass}`}>{node.icon}</span>
              <span className="mt-1 font-label-sm font-bold text-amber-600">{node.progress}%</span>
            </div>
          </div>
        </div>
      );
    }

    const isCompleted = node.status === 'completed';
    const borderClass = isCompleted ? 'border-2 border-emerald-500 glass-card shadow-md' : 'border border-outline-variant/60 bg-surface-container-low shadow-sm';
    const iconTone = isCompleted ? 'text-emerald-500' : 'text-on-surface-variant';
    const radius = nodeSize / 2 - 6;

    return (
      <div
        className={`relative flex items-center justify-center rounded-full transition-transform group-hover:scale-105 ${borderClass}`}
        style={{ width: `${nodeSize}px`, height: `${nodeSize}px` }}
      >
        <svg className={`absolute inset-0 h-full w-full -rotate-90 ${isCompleted ? '' : 'opacity-20'}`}>
          <circle cx={nodeSize / 2} cy={nodeSize / 2} fill="transparent" r={radius} stroke={isCompleted ? '#f1f5f9' : '#c7c4d7'} strokeWidth="6" />
          {isCompleted && (
            <circle cx={nodeSize / 2} cy={nodeSize / 2} fill="transparent" r={radius} stroke="#10b981" strokeDasharray="364" strokeDashoffset="0" strokeWidth="6" />
          )}
        </svg>
        <span className={`material-symbols-outlined ${iconTone} ${iconClass}`} style={isCompleted ? { fontVariationSettings: "'FILL' 1" } : undefined}>
          {node.icon}
        </span>
      </div>
    );
  };

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/30 p-4 pb-12 no-scrollbar bg-primary">
      <div className="relative px-10" style={{ width: `${timelineWidth}px`, height: `${svgHeight + 180}px` }}>
        <svg
          className="absolute left-0 top-20 pointer-events-none"
          fill="none"
          viewBox={`0 0 ${timelineWidth} ${svgHeight}`}
          style={{ width: `${timelineWidth}px`, height: `${svgHeight}px` }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={getSvgPath()} stroke="url(#gradient-line)" strokeDasharray="12 8" strokeWidth="4" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="gradient-line" x1="0" x2={timelineWidth} y1={centerY} y2={centerY}>
              <stop stopColor="#2a14b4" />
              <stop offset="1" stopColor="#4648d4" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute left-20 right-10 top-20 z-10" style={{ height: `${svgHeight}px` }}>
          {roadmapNodes.map((node, idx) => {
            const isTop = idx % 2 === 0;
            const top = isTop ? centerY - laneOffset : centerY + laneOffset;
            const left = `${(idx / Math.max(1, nodeCount - 1)) * 100}%`;
            const tone = node.status === 'completed' ? 'completed' : node.status === 'in-progress' ? 'active' : 'idle';

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => navigate(`/subject/${node.id}`)}
                className="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center border-0 bg-transparent p-0 text-left"
                style={{ left, top: `${top}px`, width: `${labelWidth}px` }}
              >
                {renderLabel(node, tone, isTop)}
                {renderNodeCircle(node)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoadmapTimeline;
