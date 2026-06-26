import React from 'react';

const InsightsChartSection = ({
  chartRange,
  currentChart,
  focusAdvice,
  focusTitle,
  hoveredBarIndex,
  hoveredXpBarIndex,
  setChartRange,
  setHoveredBarIndex,
  setHoveredXpBarIndex,
  setShowDrillModal,
  weeklyXpChart,
}) => (
  <div className="lg:col-span-2 space-y-4">
    {/* <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-on-primary shadow-xl">
      <div className="relative z-10 lg:max-w-[75%]">
        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md border border-white/20">
          <span className="material-symbols-outlined text-sm">auto_awesome</span> Recommended Focus Area
        </div>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 font-bold">{focusTitle}</h2>
        <p className="font-body-md text-body-md text-on-primary/80 mb-8 leading-relaxed">{focusAdvice} Complete this 15-minute diagnostic drill to refine your learning curve.</p>
        <button onClick={() => setShowDrillModal(true)} className="bg-white text-primary px-8 h-12 rounded-lg font-bold hover:bg-surface-container-low transition-all active:scale-95 flex items-center gap-3 shadow-md cursor-pointer">
          Start Focused Drill
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
      <div className="absolute right-[-10%] top-[-10%] opacity-20">
        <span className="material-symbols-outlined text-[300px] font-thin">psychology</span>
      </div>
    </section> */}

    <ChartCard
      activeColor="primary"
      chart={currentChart}
      hoveredIndex={hoveredBarIndex}
      labelSuffix={(bar) => `%${bar.active && chartRange === 'weekly' ? ' today' : ''}`}
      onHover={setHoveredBarIndex}
      rangeControls={{ chartRange, setChartRange }}
      subtitle="Curriculum pathway progress completed per day"
      title={chartRange === 'weekly' ? 'Daily Learning Progress' : 'Weekly Progress'}
      valueKey="progress"
    />
    <ChartCard
      activeColor="amber-500"
      chart={weeklyXpChart}
      hoveredIndex={hoveredXpBarIndex}
      labelSuffix={(bar) => ` XP${bar.active ? ' today' : ''}`}
      onHover={setHoveredXpBarIndex}
      subtitle="Points and experience (XP) earned day-wise"
      title="Daily XP Breakdown"
      valueKey="xp"
    />
  </div>
);

const ChartCard = ({ activeColor, chart, hoveredIndex, labelSuffix, onHover, rangeControls, subtitle, title, valueKey }) => (
  <section className="bg-white p-4 md:p-5 rounded-xl border border-outline-variant/20 shadow-sm">
    <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
      <div>
        <h3 className="font-headline-md text-lg md:text-xl text-on-surface font-bold">{title}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{subtitle}</p>
      </div>
      {rangeControls && (
        <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/20">
          {['weekly', 'monthly'].map((range) => (
            <button
              key={range}
              onClick={() => rangeControls.setChartRange(range)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                rangeControls.chartRange === range ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {range[0].toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
    <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 px-1 relative pt-6 border-b border-outline-variant/20">
      {chart.map((bar, idx) => {
        const isBarActive = bar.active;
        const isHovered = hoveredIndex === idx;
        const textColor = activeColor === 'primary' ? 'text-primary' : 'text-amber-600';
        const activeBar = activeColor === 'primary' ? 'bg-primary' : 'bg-amber-500';
        const idleBar = activeColor === 'primary' ? 'bg-primary/20 hover:bg-primary/35' : 'bg-amber-500/20 hover:bg-amber-500/35';
        const hoverRing = isHovered ? 'ring-2 ring-offset-2 ring-outline-variant/50' : '';
        return (
          <div key={idx} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 group cursor-pointer relative" onMouseEnter={() => onHover(idx)} onMouseLeave={() => onHover(null)}>
            <div className={`text-[10px] font-black whitespace-nowrap ${isBarActive || isHovered ? textColor : 'text-on-surface-variant'}`}>{bar[valueKey]}{labelSuffix(bar)}</div>
            <div className="w-full max-w-10 h-40 flex items-end">
              <div
                className={`w-full min-h-[8px] rounded-none transition-all ${isBarActive ? activeBar : idleBar} ${hoverRing}`}
                style={{ height: `${bar.percent}%` }}
                title={`${bar.dateLabel || bar.label}: ${bar[valueKey]}${labelSuffix(bar)}`}
              />
            </div>
            <span className={`text-[11px] font-bold leading-none ${isBarActive ? textColor : 'text-on-surface-variant'}`}>{bar.label}</span>
            {bar.dateLabel && (
              <span className="text-[9px] leading-none text-on-surface-variant/80 whitespace-nowrap">{bar.dateLabel}</span>
            )}
          </div>
        );
      })}
    </div>
  </section>
);

export default InsightsChartSection;
