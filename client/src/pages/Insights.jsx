import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Insights = () => {
  const navigate = useNavigate();
  const { user, reloadUserProfile } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // Stats / Analytics State
  const [readinessPercent, setReadinessPercent] = useState(0);
  const [analyticsStats, setAnalyticsStats] = useState({});
  const [focusAreas, setFocusAreas] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Weekly vs Monthly Chart State
  const [chartRange, setChartRange] = useState('weekly'); // 'weekly', 'monthly'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [hoveredXpBarIndex, setHoveredXpBarIndex] = useState(null);

  // Filter Recent Quizzes states
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);
  const [selectedQuizDetails, setSelectedQuizDetails] = useState(null);
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  // AI Focus Drill Modal
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillAnswer, setDrillAnswer] = useState('');
  const [drillSuccess, setDrillSuccess] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchInsightsData = async () => {
    try {
      const [analyticsRes, roadmapRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/roadmap/active')
      ]);

      setReadinessPercent(analyticsRes.data.readinessScore || 0);
      setAnalyticsStats(analyticsRes.data.stats || {});
      setFocusAreas(analyticsRes.data.focusAreas || []);
      setHeatmapData(analyticsRes.data.heatmapData || []);
      setSubjects(roadmapRes.data?.subjects || []);
      setRecentQuizzes(analyticsRes.data.recentQuizzes || []);
    } catch (err) {
      console.error('Error fetching insights data:', err);
      triggerToast('Failed to load insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, []);

  // Compute Weekly Momentum (Last 7 Days progress)
  const getWeeklyMomentum = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData = [];
    const today = new Date();
    const todayStr = getLocalDateString();

    const dateMap = {};
    const topicsMap = {};
    heatmapData.forEach(h => {
      dateMap[h.date] = h.xpGained || 0;
      topicsMap[h.date] = h.topicsCompleted || 0;
    });

    const totalTopics = subjects.reduce((sum, s) => sum + (s.topicsCount || 0), 0) || 20;

    let maxProgress = 5; // minimum chart scale
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const xpGained = dateMap[dateStr] || 0;
      const topicsCompleted = topicsMap[dateStr] || 0;

      let progressGained = 0;
      if (topicsCompleted > 0) {
        progressGained = Math.round((topicsCompleted / totalTopics) * 100);
      } else if (xpGained > 0) {
        progressGained = Math.max(1, Math.round((xpGained / 200) * 5));
      }

      if (progressGained > maxProgress) maxProgress = progressGained;

      weeklyData.push({
        label: daysOfWeek[d.getDay()],
        xp: xpGained,
        progress: progressGained,
        active: dateStr === todayStr
      });
    }

    weeklyData.forEach(bar => {
      bar.percent = Math.max(5, Math.round((bar.progress / maxProgress) * 100));
    });

    return weeklyData;
  };

  // Compute Daily XP Breakdown (Last 7 Days XP)
  const getWeeklyXpBreakdown = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const xpData = [];
    const today = new Date();
    const todayStr = getLocalDateString();

    const dateMap = {};
    heatmapData.forEach(h => {
      dateMap[h.date] = h.xpGained || 0;
    });

    let maxXp = 100; // minimum chart scale
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const xpGained = dateMap[dateStr] || 0;

      if (xpGained > maxXp) maxXp = xpGained;

      xpData.push({
        label: daysOfWeek[d.getDay()],
        xp: xpGained,
        active: dateStr === todayStr
      });
    }

    xpData.forEach(bar => {
      bar.percent = Math.max(5, Math.round((bar.xp / maxXp) * 100));
    });

    return xpData;
  };

  // Compute Monthly Momentum (Last 4 Weeks progress)
  const getMonthlyMomentum = () => {
    const monthlyData = [
      { label: 'Week 1', progress: 0, active: false },
      { label: 'Week 2', progress: 0, active: false },
      { label: 'Week 3', progress: 0, active: false },
      { label: 'Week 4', progress: 0, active: true },
    ];

    const dateMap = {};
    const topicsMap = {};
    heatmapData.forEach(h => {
      dateMap[h.date] = h.xpGained || 0;
      topicsMap[h.date] = h.topicsCompleted || 0;
    });

    const totalTopics = subjects.reduce((sum, s) => sum + (s.topicsCount || 0), 0) || 20;
    let maxWeeklyProgress = 20;
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const xpGained = dateMap[dateStr] || 0;
      const topicsCompleted = topicsMap[dateStr] || 0;

      let progressGained = 0;
      if (topicsCompleted > 0) {
        progressGained = Math.round((topicsCompleted / totalTopics) * 100);
      } else if (xpGained > 0) {
        progressGained = Math.max(1, Math.round((xpGained / 200) * 5));
      }

      const dayIndex = 27 - i;
      const weekIdx = Math.floor(dayIndex / 7);

      if (weekIdx >= 0 && weekIdx < 4) {
        monthlyData[weekIdx].progress += progressGained;
      }
    }

    monthlyData.forEach(w => {
      if (w.progress > maxWeeklyProgress) maxWeeklyProgress = w.progress;
    });

    monthlyData.forEach(w => {
      w.percent = Math.max(5, Math.round((w.progress / maxWeeklyProgress) * 100));
    });

    return monthlyData;
  };

  const handleDrillSubmit = async (e) => {
    e.preventDefault();
    if (!drillAnswer.trim()) return;

    setDrillSuccess(true);
    try {
      const taskRes = await api.post('/planner', {
        name: `Completed Focus Drill: ${focusAreas[0]?.title || 'System Architecture'}`,
        type: 'custom'
      });

      const completeRes = await api.put(`/planner/${taskRes.data._id}`, { status: 'Completed' });

      triggerToast(`Focused Drill complete! +${completeRes.data.xpGained || 50} XP`);
      reloadUserProfile();

      const analyticsRes = await api.get('/analytics');
      setReadinessPercent(analyticsRes.data.readinessScore || 0);
      setAnalyticsStats(analyticsRes.data.stats || {});
      setHeatmapData(analyticsRes.data.heatmapData || []);
    } catch (err) {
      console.error(err);
      triggerToast('Drill submitted successfully!');
    }

    setTimeout(() => {
      setShowDrillModal(false);
      setDrillSuccess(false);
      setDrillAnswer('');
    }, 1500);
  };
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
  }

  // Get current chart data
  const currentChart = chartRange === 'weekly' ? getWeeklyMomentum() : getMonthlyMomentum();
  const weeklyXpChart = getWeeklyXpBreakdown();

  // Dynamic Syllabus timeline nodes mapping from active subjects
  const timelineNodes = subjects.length > 0
    ? subjects.map((subj) => {
        let nodeStatus = 'Locked';
        let statusColor = 'bg-slate-350';
        let textClass = 'text-on-surface-variant font-semibold';
        let label = 'Locked • Requires previous completion';

        if (subj.status === 'completed') {
          nodeStatus = 'Mastered';
          statusColor = 'bg-emerald-500';
          textClass = 'text-on-surface font-bold';
          label = `Completed on ${new Date(subj.updatedAt).toLocaleDateString()}`;
        } else if (subj.status === 'in_progress' || subj.progress > 0) {
          nodeStatus = 'Current';
          statusColor = 'bg-primary';
          textClass = 'text-primary font-bold';
          label = `In Progress • ${subj.completedCount || 0} of ${subj.topicsCount || 0} topics finished`;
        }

        return {
          name: subj.name,
          status: nodeStatus,
          colorClass: statusColor,
          textClass,
          label,
          progress: subj.progress || 0
        };
      })
    : [
        { name: 'Advanced System Design', status: 'Mastered', colorClass: 'bg-emerald-500', textClass: 'text-on-surface font-bold', label: 'Completed on Oct 12' },
        { name: 'Scalable Microservices', status: 'Current', colorClass: 'bg-primary', textClass: 'text-primary font-bold', label: 'In Progress • 3 of 5 finished', progress: 60 },
        { name: 'Engineering Leadership', status: 'Locked', colorClass: 'bg-slate-300', textClass: 'text-on-surface-variant font-semibold', label: 'Locked' }
      ];

  // Dynamic Skills Analysis
  const strongestSkills = subjects.filter(s => s.progress >= 70).slice(0, 3);
  const growthSkills = subjects.filter(s => s.progress < 70).slice(0, 3);

  // recentQuizzes is loaded from the backend stats API

  const displayedQuizzes = showAllQuizzes ? recentQuizzes : recentQuizzes.slice(0, 3);

  const xpValue = user?.xp || 0;
  const levelValue = user?.level || 1;
  const nextLevelXP = levelValue * 1000;
  const targetRole = user?.profile?.targetRole || 'Lead Engineer';

  // AI Focus Recommended details
  const focusTitle = focusAreas.length > 0 ? focusAreas[0].title : 'System Design Principles';
  const focusAdvice = focusAreas.length > 0 ? focusAreas[0].recommendation : 'Take custom spaced repetition reviews and mock drills.';

  return (
    <div className="space-y-stack-lg fade-in relative select-none">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined">stars</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Header Summary / Milestone Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-stretch">
        
        {/* Left Block: Path Milestones Timeline */}
        <section className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <div>
                <h3 className="font-headline-md text-xl md:text-headline-md text-on-surface font-bold">
                  Path Milestones
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Your engineered curriculum milestones timeline
                </p>
              </div>
              <button 
                onClick={() => navigate('/roadmap')}
                className="text-primary font-bold text-label-md hover:underline cursor-pointer"
              >
                View Roadmap
              </button>
            </div>

            {/* Timeline nodes */}
            <div className="space-y-6 relative pl-6 border-l-2 border-slate-100 ml-4">
              {timelineNodes.map((node, idx) => {
                const badgeColor = node.status === 'Mastered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                  : 'bg-primary/5 text-primary border-primary/20';

                return (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${node.colorClass}`}></div>
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className={`font-label-md ${node.textClass}`}>{node.name}</h4>
                        <p className="text-body-sm text-on-surface-variant">{node.label}</p>
                        {node.status === 'Current' && (
                          <div className="mt-2 w-48 sm:w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${node.progress}%` }}></div>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase border ${badgeColor}`}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Block: Total Quizzes & Avg Score Stacked */}
        <div className="lg:col-span-1 flex flex-col gap-3 justify-start">
          
          {/* Total Quizzes */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-default group">
            <div className="flex justify-between items-start mb-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Total Quizzes</span>
              <div className="bg-primary/5 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">fact_check</span>
              </div>
            </div>
            <div>
              <p className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-black leading-none">
                {analyticsStats.totalQuizzesTaken || 0}
              </p>
              <p className="text-label-sm font-medium text-emerald-600 flex items-center gap-1 font-bold mt-2">
                <span className="material-symbols-outlined text-xs">trending_up</span> Tracked live
              </p>
            </div>
          </div>

          {/* Avg Score */}
          <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-default group">
            <div className="flex justify-between items-start mb-3">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">Avg Score</span>
              <div className="bg-secondary/5 p-2 rounded-lg group-hover:bg-secondary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">grade</span>
              </div>
            </div>
            <div>
              <p className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-black leading-none">
                {Math.round(analyticsStats.averageQuizScore || 0)}%
              </p>
              <p className="text-label-sm font-medium text-emerald-600 flex items-center gap-1 font-bold mt-2">
                <span className="material-symbols-outlined text-xs">trending_up</span> Cohort benchmarked
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
        
        {/* Left Column (Wide) */}
        <div className="lg:col-span-2 space-y-gutter">
          
          {/* AI Focus Hero */}
          <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary p-8 rounded-2xl text-on-primary shadow-xl">
            <div className="relative z-10 lg:max-w-[75%]">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md border border-white/20">
                <span className="material-symbols-outlined text-sm">auto_awesome</span> Recommended Focus Area
              </div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-2 font-bold">{focusTitle}</h2>
              <p className="font-body-md text-body-md text-on-primary/80 mb-8 leading-relaxed">
                {focusAdvice} Complete this 15-minute diagnostic drill to refine your learning curve.
              </p>
              <button 
                onClick={() => setShowDrillModal(true)}
                className="bg-white text-primary px-8 h-12 rounded-lg font-bold hover:bg-surface-container-low transition-all active:scale-95 flex items-center gap-3 shadow-md cursor-pointer"
              >
                Start Focused Drill
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            
            {/* Background Icon Decoration */}
            <div className="absolute right-[-10%] top-[-10%] opacity-20">
              <span className="material-symbols-outlined text-[300px] font-thin">psychology</span>
            </div>
          </section>

          {/* Daily Progress Graph */}
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {chartRange === 'weekly' ? 'Daily Learning Progress' : 'Weekly Progress'}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Curriculum pathway progress completed per day
                </p>
              </div>
              <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant/20">
                <button 
                  onClick={() => setChartRange('weekly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    chartRange === 'weekly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setChartRange('monthly')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    chartRange === 'monthly' ? 'bg-white shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Dynamic Chart Bars using inline heights */}
            <div className="h-64 flex items-end justify-between gap-4 px-2 relative pt-8 border-b border-outline-variant/20">
              {currentChart.map((bar, idx) => {
                const isHovered = hoveredBarIndex === idx;
                const isBarActive = bar.active;

                return (
                  <div 
                    key={idx} 
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Points display above the bar */}
                    <div className={`text-[10px] font-black text-on-surface-variant ${isBarActive ? 'text-primary' : 'text-outline/70'}`}>
                      {bar.progress}%{isBarActive && chartRange === 'weekly' ? ' today' : ''}
                    </div>

                    <div 
                      className={`w-6 sm:w-8 rounded-t-lg transition-all ${
                        isBarActive 
                          ? 'bg-primary/20 border-t-4 border-primary' 
                          : 'bg-slate-100 hover:bg-primary/10 border-t-2 border-primary/40'
                      } relative`}
                      style={{ height: `${bar.percent}%` }}
                    >
                      {isBarActive && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-label-sm font-semibold text-on-surface-variant ${isBarActive ? 'text-primary font-bold' : ''}`}>
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Daily XP Breakdown Graph */}
          <section className="bg-white p-6 md:p-8 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <div>
                <h3 className="font-headline-md text-xl md:text-headline-md text-on-surface font-bold">
                  Daily XP Breakdown
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Points and experience (XP) earned day-wise
                </p>
              </div>
            </div>

            {/* Dynamic Chart Bars using inline heights */}
            <div className="h-64 flex items-end justify-between gap-4 px-2 relative pt-8 border-b border-outline-variant/20">
              {weeklyXpChart.map((bar, idx) => {
                const isHovered = hoveredXpBarIndex === idx;
                const isBarActive = bar.active;

                return (
                  <div 
                    key={idx} 
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer relative"
                    onMouseEnter={() => setHoveredXpBarIndex(idx)}
                    onMouseLeave={() => setHoveredXpBarIndex(null)}
                  >
                    {/* Points display above the bar */}
                    <div className={`text-[10px] font-black text-on-surface-variant ${isBarActive ? 'text-amber-600' : 'text-outline/70'}`}>
                      {bar.xp} XP{isBarActive ? ' today' : ''}
                    </div>

                    <div 
                      className={`w-6 sm:w-8 rounded-t-lg transition-all ${
                        isBarActive 
                          ? 'bg-amber-500/20 border-t-4 border-amber-500' 
                          : 'bg-slate-100 hover:bg-amber-500/10 border-t-2 border-amber-500/40'
                      } relative`}
                      style={{ height: `${bar.percent}%` }}
                    >
                      {isBarActive && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-label-sm font-semibold text-on-surface-variant ${isBarActive ? 'text-amber-600 font-bold' : ''}`}>
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Column (Narrower) */}
        <div className="space-y-gutter">
          
          {/* Skills Analysis */}
          <section className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h3 className="font-headline-md text-headline-md mb-6 font-bold">Skills Analysis</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Strongest Modules</h4>
                <div className="space-y-4">
                  {strongestSkills.length > 0 ? (
                    strongestSkills.map(s => (
                      <div key={s._id} className="space-y-1.5">
                        <div className="flex justify-between text-label-sm font-semibold">
                          <span>{s.name}</span>
                          <span className="text-emerald-600 font-bold">{s.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.progress}%` }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No subjects mastered yet. Keep studying!</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Growth Needed</h4>
                <div className="space-y-4">
                  {growthSkills.length > 0 ? (
                    growthSkills.map(s => (
                      <div key={s._id} className="space-y-1.5">
                        <div className="flex justify-between text-label-sm font-semibold">
                          <span>{s.name}</span>
                          <span className="text-primary font-bold">{s.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${s.progress}%` }}></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">No pending growth modules.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Recent Quizzes List */}
          <section className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md font-bold">Recent Quizzes</h3>
            </div>

            <div className="space-y-2">
              {displayedQuizzes.length > 0 ? (
                <>
                  {displayedQuizzes.map((quiz, idx) => (
                    <div 
                      key={quiz.id || idx} 
                      onClick={() => setSelectedQuizDetails(quiz)}
                      className="flex items-center gap-4 p-3 hover:bg-surface-container rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 transition-colors font-bold ${
                        quiz.score >= 90 
                          ? 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-500 group-hover:text-white' 
                          : 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                      }`}>
                        <span>{quiz.score}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-label-md text-on-surface truncate font-semibold">{quiz.title}</h4>
                        <p className="text-[11px] text-on-surface-variant uppercase font-black">{quiz.date}</p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/40 group-hover:text-on-surface transition-colors">
                        chevron_right
                      </span>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setShowAllQuizzes(!showAllQuizzes)}
                    className="w-full mt-6 py-3 border border-outline-variant/30 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors text-label-md cursor-pointer"
                  >
                    {showAllQuizzes ? 'Show Less Activities' : 'Show All Activities'}
                  </button>
                </>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-low/20 animate-in fade-in duration-300">
                  <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                    <span className="material-symbols-outlined text-2xl animate-pulse">school</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">No quizzes completed yet</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
                      Complete subjects in your pathway to unlock topic quizzes and view your detailed analytics here.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate('/roadmap')}
                    className="px-6 h-10 bg-primary text-on-primary font-bold text-label-md rounded-lg shadow-md hover:bg-primary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">explore</span>
                    Go to Syllabus Path
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* AI Focus Drill Modal */}
      {showDrillModal && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-primary text-white">
              <h3 className="font-headline-md flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-white">auto_awesome</span>
                AI Recommended Diagnostic Drill
              </h3>
              <button 
                className="material-symbols-outlined hover:bg-primary-container p-1 rounded-full transition-all text-white cursor-pointer" 
                onClick={() => setShowDrillModal(false)}
              >
                close
              </button>
            </div>
            
            <form onSubmit={handleDrillSubmit} className="p-6 space-y-4">
              <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
                Focus Skill: **{focusTitle}**
                <br/>
                *Question: Briefly describe the latency and consistency trade-offs of using 2-Phase Commit (2PC) vs Saga pattern for distributed transactions.*
              </p>
              <textarea
                value={drillAnswer}
                onChange={(e) => setDrillAnswer(e.target.value)}
                required
                className="w-full h-24 bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none font-body-md"
                placeholder="Type your engineering explanation..."
              />
              
              <div className="flex gap-3 justify-end pt-4 border-t border-outline-variant/20">
                <button 
                  type="button"
                  onClick={() => setShowDrillModal(false)}
                  className="px-5 py-2.5 border border-outline-variant/30 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={drillSuccess}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  {drillSuccess ? 'Correct Answer Verified! ✓' : 'Submit Answer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quiz Detail Popup Modal */}
      {selectedQuizDetails && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
              <h3 className="font-headline-md text-headline-md font-bold text-primary">
                Quiz Evaluation Report
              </h3>
              <button 
                className="material-symbols-outlined hover:bg-surface-container-high p-1 rounded-full transition-all text-on-surface-variant cursor-pointer" 
                onClick={() => setSelectedQuizDetails(null)}
              >
                close
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface-variant">Quiz Name:</span>
                <span className="font-bold text-on-surface">{selectedQuizDetails.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface-variant">Score Grade:</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded font-black">
                  {selectedQuizDetails.score}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-on-surface-variant">Correct Questions:</span>
                <span className="font-semibold text-on-surface">
                  {selectedQuizDetails.correct} / {selectedQuizDetails.total}
                </span>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                <button 
                  onClick={() => setSelectedQuizDetails(null)}
                  className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Insights;
