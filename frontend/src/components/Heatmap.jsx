import React from 'react';

const Heatmap = ({ history = [] }) => {
  // Generate list of last 112 days (16 weeks * 7 days) ending today
  const generateGridDays = () => {
    const days = [];
    const today = new Date();
    
    // Go back 112 days
    for (let i = 111; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      days.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  };

  const gridDays = generateGridDays();

  // Color mapper based on study hours delta
  const getColorClass = (dateStr) => {
    const log = history.find(h => h.date === dateStr);
    if (!log) return 'bg-gray-100 border border-gray-200/50';

    const hours = log.hoursStudied || 0;
    if (hours === 0) return 'bg-gray-100 border border-gray-200/50';
    if (hours <= 1) return 'bg-blue-100 border border-blue-200';
    if (hours <= 2) return 'bg-blue-300 border border-blue-400';
    if (hours <= 4) return 'bg-blue-500 border border-blue-600';
    return 'bg-blue-700 border border-blue-800'; // High study hours
  };

  const getLogDetails = (dateStr) => {
    const log = history.find(h => h.date === dateStr);
    if (!log) return 'No activity logged';
    return `${log.hoursStudied ? log.hoursStudied.toFixed(1) : 0} hrs studied, ${log.tasksCompleted || 0} tasks completed`;
  };

  return (
    <div className="w-full bg-white border border-customBorder rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-customText">Consistency Visualizer</h4>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>Less</span>
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-300 border border-blue-400 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-500 border border-blue-600 rounded-sm"></div>
          <div className="w-3 h-3 bg-blue-700 border border-blue-800 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>
      
      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[640px]">
          {gridDays.map((day, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 group relative cursor-pointer ${getColorClass(day.date)}`}
            >
              {/* Custom Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2.5 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                <span className="font-semibold">{day.label}</span>
                <br />
                {getLogDetails(day.date)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
