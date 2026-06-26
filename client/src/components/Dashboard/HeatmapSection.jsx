import React from 'react';

const HeatmapSection = ({ heatmapData }) => (
  <section className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Learning Consistency</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Daily study activity over the past year</p>
      </div>
      <div className="flex items-center gap-2 text-label-sm text-on-surface-variant font-bold">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-surface-container" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/70" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
    <div className="overflow-x-auto hide-scrollbar">
      <div className="inline-grid grid-flow-col grid-rows-7 gap-1 min-w-max pb-2">
        {heatmapData.map((intensityClass, idx) => (
          <div key={idx} className={`w-3 h-3 rounded-sm ${intensityClass}`} />
        ))}
      </div>
    </div>
  </section>
);

export default HeatmapSection;
