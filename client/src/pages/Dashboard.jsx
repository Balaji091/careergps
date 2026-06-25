import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, reloadUserProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [readinessPercent, setReadinessPercent] = useState(0);
  const [analyticsStats, setAnalyticsStats] = useState({});
  const [focusAreas, setFocusAreas] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Gamification & Custom suggests states
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillAnswer, setDrillAnswer] = useState('');
  const [drillSuccess, setDrillSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const mapHeatmap = (history = []) => {
    const intensities = [
      'bg-surface-container',
      'bg-primary/20',
      'bg-primary/40',
      'bg-primary/70',
      'bg-primary',
    ];

    const result = [];
    const dateMap = {};
    history.forEach(h => {
      dateMap[h.date] = h;
    });

    const today = new Date();
    for (let i = 363; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const entry = dateMap[dateStr];
      if (!entry) {
        result.push(intensities[0]);
      } else {
        const xpGained = entry.xpGained || 0;
        if (xpGained === 0) result.push(intensities[0]);
        else if (xpGained <= 20) result.push(intensities[1]);
        else if (xpGained <= 50) result.push(intensities[2]);
        else if (xpGained <= 100) result.push(intensities[3]);
        else result.push(intensities[4]);
      }
    }
    return result;
  };

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, plannerRes, roadmapRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/planner'),
        api.get('/roadmap/active')
      ]);

      setReadinessPercent(analyticsRes.data.readinessScore || 0);
      setAnalyticsStats(analyticsRes.data.stats || {});
      setFocusAreas(analyticsRes.data.focusAreas || []);
      setAchievements(analyticsRes.data.achievements || []);
      setChecklist(plannerRes.data || []);
      setHeatmapData(mapHeatmap(analyticsRes.data.heatmapData || []));
      setSubjects(roadmapRes.data?.subjects || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleChecklistItem = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.put(`/planner/${taskId}`, { status: nextStatus });
      setChecklist(prev => prev.map(item => item._id === taskId ? res.data.task : item));
      reloadUserProfile();

      // Refresh stats
      const statsRes = await api.get('/analytics');
      setReadinessPercent(statsRes.data.readinessScore || 0);
      setAnalyticsStats(statsRes.data.stats || {});
      setHeatmapData(mapHeatmap(statsRes.data.heatmapData || []));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleDrillSubmit = async (e) => {
    e.preventDefault();
    setDrillSuccess(true);
    try {
      const focusTitle = focusAreas[0]?.title || 'System Architecture';
      const completeRes = await api.post('/planner', {
        name: `Completed Focus Drill: ${focusTitle}`,
        status: 'Completed',
        type: 'custom',
      });
      triggerToast(`Focused Drill complete! +${completeRes.data.xpGained || 50} XP`);
      
      reloadUserProfile();
      fetchDashboardData();
      
      setShowDrillModal(false);
      setDrillSuccess(false);
      setDrillAnswer('');
    } catch (err) {
      console.error('Failed to submit focus drill:', err);
      setDrillSuccess(false);
      triggerToast('Failed to submit focus drill');
    }
  };

  const getTaskDescription = (task) => {
    switch (task.type) {
      case 'learn':
        return 'Study core lessons and concepts.';
      case 'revise':
        return 'Review spaced-repetition cards.';
      case 'review_notes':
        return 'Write or review study notes.';
      case 'interview':
        return 'Complete mock interview prep.';
      case 'custom':
      default:
        return 'Custom scheduled task.';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
  }

  const completedCount = checklist.filter(item => item.status === 'Completed').length;
  const modulesLeft = subjects.filter(s => s.status !== 'completed').length;
  const targetRole = user?.profile?.targetRole || 'Lead Engineer';

  // Map dynamic achievements to display cards
  const badgeItems = achievements.length > 0
    ? achievements.map((ach, idx) => {
        let icon = 'emoji_events';
        const bid = ach.badgeIcon || '';
        if (bid.includes('streak')) icon = 'local_fire_department';
        else if (bid.includes('notes')) icon = 'history_edu';
        else if (bid.includes('quiz')) icon = 'school';
        else if (bid.includes('interview')) icon = 'psychology';
        else if (bid.includes('subject')) icon = 'workspace_premium';
        else if (bid.includes('certificate')) icon = 'card_membership';

        const colors = [
          'bg-primary-container text-on-primary-container',
          'bg-secondary-container text-white',
          'bg-tertiary-container text-white',
          'bg-orange-100 text-orange-600'
        ];

        const isCert = bid.includes('certificate');
        return {
          name: ach.title,
          earned: `Earned ${new Date(ach.unlockedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
          icon,
          active: true,
          isCertificate: isCert,
          color: isCert 
            ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 border border-amber-400 shadow-md shadow-amber-200' 
            : colors[idx % colors.length]
        };
      })
    : [
        { name: 'System Design Master', earned: 'Locked', icon: 'workspace_premium', active: false, color: 'bg-surface-container text-on-surface-variant' },
        { name: 'SQL Expert', earned: 'Locked', icon: 'database', active: false, color: 'bg-surface-container text-on-surface-variant' },
        { name: 'Cloud Associate', earned: 'Locked', icon: 'cloud', active: false, color: 'bg-surface-container text-on-surface-variant' },
        { name: 'Communication Lead', earned: 'Locked', icon: 'verified', active: false, color: 'bg-surface-container text-on-surface-variant' },
      ];

  // SVG Progress Ring calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius; // 263.89
  const strokeDashoffset = circumference - (circumference * Math.min(readinessPercent, 100)) / 100;

  // Get dynamic readiness advice
  const readinessAdvice = focusAreas.length > 0
    ? `Focus on "${focusAreas[0].title}" to boost your score to the next percentile.`
    : 'All focus areas check out! Run mock interviews and practice boards.';

  return (
    <div className="space-y-stack-lg fade-in">
      {/* Hero Row: Readiness & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Readiness Score Card */}
        <div className="lg:col-span-4 bg-white rounded-xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 mb-6">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-surface-container"
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeWidth="8"
              />
              <circle
                className="text-primary progress-ring__circle"
                cx="50"
                cy="50"
                fill="transparent"
                r={radius}
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline-xl text-headline-xl text-primary font-black">{readinessPercent}%</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">
                Readiness
              </span>
            </div>
          </div>
          <h3 className="font-headline-md text-headline-md mb-2 text-on-surface font-bold">
            {readinessPercent >= 75 ? 'Almost Market Ready' : (readinessPercent >= 50 ? 'Tracking Well' : 'Needs Focus')}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            {readinessAdvice}
          </p>
        </div>

        {/* Bento Style Stats/Insights */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-gutter">
          
          {/* Card 1: Next Career Goal & Path Completion */}
          <div className="bg-primary-container text-on-primary-container rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-md">
            <div className="z-10">
              <span className="font-label-md text-label-md opacity-80 uppercase tracking-wider font-bold">Next Career Goal</span>
              <h4 className="font-headline-md text-headline-md mt-1 font-bold">{targetRole}</h4>
            </div>
            <div className="z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="font-body-sm text-body-sm font-semibold">{modulesLeft} modules left</span>
                <span className="font-label-md text-label-md font-bold">
                  {Math.round(analyticsStats.roadmapCompletion || 0)}% Path Completion
                </span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500" 
                  style={{ width: `${analyticsStats.roadmapCompletion || 0}%` }}
                ></div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-white/10 text-9xl pointer-events-none select-none">
              trending_up
            </span>
          </div>

          {/* Card 2: Gaming Level & XP Progression */}
          <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-lg border border-indigo-900/50">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl -ml-8 -mb-8"></div>
            
            <div className="z-10 flex justify-between items-start">
              <div>
                <span className="font-label-md text-label-md text-indigo-200 uppercase tracking-widest font-black">Level Stats</span>
                <div className="flex items-center gap-2 mt-1">
                  <h4 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                    Lvl {user?.level || 1}
                  </h4>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pro Builder
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400 shadow-md">
                <span className="material-symbols-outlined text-3xl font-black">sports_esports</span>
              </div>
            </div>

            <div className="z-10">
              <div className="flex justify-between items-end mb-1 text-xs font-bold text-indigo-200">
                <span>XP Progress</span>
                <span className="text-amber-300">
                  {user?.xp || 0} / {(user?.level - 1) * 200 + 100} XP
                </span>
              </div>
              <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(251,191,36,0.5)]" 
                  style={{ width: `${Math.min(((user?.xp || 0) / ((user?.level - 1) * 200 + 100)) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-indigo-300 mt-2 font-medium">
                Earn XP by completing topics, checklists, and focused drills!
              </p>
            </div>
          </div>

          {/* Card 3: Quiz Performance Metrics */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                Quiz Performance
              </span>
              <h4 className="font-headline-md text-headline-md mt-2 font-bold">
                Average Score: {Math.round(analyticsStats.averageQuizScore || 0)}%
              </h4>
              <p className="text-on-surface-variant text-body-sm font-medium">
                {analyticsStats.totalQuizzesTaken || 0} Quizzes Completed
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">analytics</span>
              <span className="font-label-sm text-label-sm font-bold">
                {analyticsStats.averageQuizScore >= 80 ? 'Above Average' : (analyticsStats.averageQuizScore >= 50 ? 'Average' : 'Needs Study')}
              </span>
            </div>
          </div>

          {/* Card 4: Daily Goal / Checklist */}
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
                Daily Checklist
              </h4>
              <span className="font-label-sm text-label-sm text-primary font-bold">
                {completedCount}/{checklist.length} Done
              </span>
            </div>
            <ul className="space-y-3 flex-1 overflow-y-auto max-h-32 pr-1 custom-scrollbar">
              {checklist.length > 0 ? (
                checklist.map((item) => {
                  const isCompleted = item.status === 'Completed';
                  return (
                    <li
                      key={item._id}
                      onClick={() => toggleChecklistItem(item._id, item.status)}
                      className="flex items-center gap-2.5 p-2 bg-surface-container-low rounded-lg group cursor-pointer hover:bg-surface-container transition-colors"
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isCompleted
                            ? 'bg-primary border-primary'
                            : 'border-outline group-hover:border-primary'
                        }`}
                      >
                        {isCompleted && (
                          <span className="material-symbols-outlined text-white text-[10px] font-black">check</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`font-body-sm text-body-sm transition-all select-none font-bold truncate ${
                            isCompleted ? 'text-on-surface-variant line-through font-normal' : 'text-on-surface'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </li>
                  );
                })
              ) : (
                <p className="text-xs text-on-surface-variant italic py-3 text-center">
                  No tasks today. Go to Planner to build!
                </p>
              )}
            </ul>
          </div>

        </div>
      </div>

      {/* AI Recommended Focus Area Banner */}
      {/* {focusAreas.length > 0 && (
        <section className="bg-gradient-to-r from-primary to-[#4648d4] text-white rounded-xl p-6 relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="relative z-10 max-w-xl text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Recommended Focus Area
            </div>
            <h3 className="font-headline-md text-headline-md font-bold mb-1">{focusAreas[0].title}</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {focusAreas[0].recommendation} Complete this focused diagnostic drill to lock in concepts and earn **+50 XP**!
            </p>
          </div>
          
          <div className="relative z-10 shrink-0">
            <button 
              onClick={() => {
                setDrillAnswer('');
                setDrillSuccess(false);
                setShowDrillModal(true);
              }}
              className="bg-white text-primary px-6 h-11 rounded-lg font-bold hover:bg-surface-container-low transition-all active:scale-95 flex items-center gap-2 shadow-md cursor-pointer text-sm"
            >
              Start Focused Drill
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Background Icon Decoration */}
          <div className="absolute right-[-2%] top-[-30%] opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[180px] font-thin">psychology</span>
          </div>
        {/* </section>
      )} */} 

      {/* Learning Consistency Section (Heatmap) */}
      <section className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Learning Consistency</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Daily study activity over the past year</p>
          </div>
          <div className="flex items-center gap-2 text-label-sm text-on-surface-variant font-bold">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-surface-container"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/20"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/40"></div>
              <div className="w-3 h-3 rounded-sm bg-primary/70"></div>
              <div className="w-3 h-3 rounded-sm bg-primary"></div>
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

      {/* Certifications & Badges Section */}
      <section className="space-y-4">
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Certifications & Badges</h2>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
          {badgeItems.map((badge, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (badge.isCertificate) {
                  setSelectedCertificate(badge);
                }
              }}
              className={`flex-none w-48 bg-white border border-outline-variant/30 rounded-xl p-4 flex flex-col items-center text-center shadow-sm transition-all hover:scale-[1.03] duration-200 ${
                badge.isCertificate ? 'cursor-pointer border-amber-300 bg-amber-50/10 hover:border-amber-400' : ''
              } ${
                !badge.active ? 'opacity-60' : ''
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-inner ${badge.color}`}>
                <span className="material-symbols-outlined text-3xl">{badge.icon}</span>
              </div>
              <span className="font-label-md text-label-md text-on-surface mb-1 font-bold">{badge.name}</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-black">{badge.earned}</span>
              {badge.isCertificate && (
                <span className="text-[10px] text-amber-700 font-bold hover:underline mt-2">View Certificate</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Active Subjects Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-end flex-wrap gap-2">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">Active Subjects</h2>
          <span 
            onClick={() => navigate('/roadmap')}
            className="font-label-md text-label-md text-primary hover:underline cursor-pointer font-bold"
          >
            View All Pathways
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {subjects.length > 0 ? (
            subjects.map((subject) => {
              const categoryColor = subject.progress === 100 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-primary/10 text-primary';
              return (
                <div
                  key={subject._id}
                  className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold group-hover:text-primary transition-colors">
                          {subject.name}
                        </h3>
                        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                          {subject.estimatedTime || '10 days'} estimated
                        </span>
                      </div>
                      <span className={`${categoryColor} px-2 py-1 rounded text-[10px] font-bold uppercase`}>
                        {subject.difficulty || 'Core'}
                      </span>
                    </div>
                    <div className="mt-auto pt-6">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">{subject.progress}% Completed</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-1.5 rounded-full mb-6 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${subject.progress}%` }}
                        ></div>
                      </div>
                      <button 
                        onClick={() => navigate(`/subject/${subject._id}`)}
                        className="w-full py-3 bg-primary text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 duration-100 ease-in-out cursor-pointer shadow-md"
                      >
                        Resume Study
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center text-sm text-on-surface-variant italic py-6">
              No subjects generated in your learning pathway yet. Access your curriculum roadmap to get started!
            </p>
          )}
        </div>
      </section>

      {/* FAB: Quick Start (Desktop Only) */}
      <button 
        onClick={() => navigate('/roadmap')}
        className="hidden md:flex fixed bottom-8 right-8 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group items-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined">bolt</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 whitespace-nowrap font-label-md">
          Jump into Skill Lab
        </span>
      </button>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined">stars</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

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
            
            <form onSubmit={handleDrillSubmit} className="p-6 space-y-4 text-left">
              <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
                Focus Skill: <span className="text-primary">{focusAreas[0]?.title}</span>
                <br/>
                <span className="text-xs text-outline italic font-normal">Challenge: Briefly write down the consistency trade-offs of SAGAS vs 2PC for {focusAreas[0]?.title}.</span>
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
                  className="px-5 py-2.5 border border-outline-variant/30 rounded-xl font-label-md font-bold hover:bg-surface-container-high transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={drillSuccess}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md cursor-pointer text-sm"
                >
                  Submit Drill Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-[100] bg-on-surface/60 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 relative animate-in zoom-in-95 duration-300">
            {/* Elegant Background Decoration */}
            <div className="bg-[#fdfcfa] border-[16px] border-double border-amber-800/20 m-4 rounded-xl flex flex-col justify-between p-8 text-center relative z-10 shadow-inner">
              
              {/* Header Decorative Corner Ornaments */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-800/30"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-800/30"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-800/30"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-800/30"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-6 right-6 material-symbols-outlined text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-all cursor-pointer z-50"
              >
                close
              </button>

              {/* Title Section */}
              <div className="space-y-2 mt-4">
                <span className="font-label-sm text-label-sm text-amber-800 tracking-widest font-black uppercase block">Career GPS Pathway Certification</span>
                <h3 className="font-serif text-3xl md:text-4xl text-amber-900 font-bold tracking-wide italic">Certificate of Completion</h3>
              </div>

              {/* Body Section */}
              <div className="my-6 space-y-4">
                <p className="font-serif text-sm md:text-base text-on-surface-variant italic">This certifies that</p>
                <h4 className="font-sans text-2xl md:text-3xl text-on-surface font-extrabold tracking-wide uppercase border-b border-amber-800/10 pb-2 max-w-md mx-auto">
                  {user?.name || 'User'}
                </h4>
                <p className="font-serif text-sm md:text-base text-on-surface-variant leading-relaxed italic max-w-lg mx-auto">
                  has successfully completed all subject modules and met the target criteria for the professional learning curriculum of
                </p>
                <h5 className="font-sans text-xl md:text-2xl text-primary font-bold tracking-wide">
                  {selectedCertificate.name.replace('Certificate: ', '')}
                </h5>
              </div>

              {/* Footer Section */}
              <div className="flex justify-between items-end mt-4 px-6 gap-6">
                {/* Date */}
                <div className="text-left">
                  <div className="w-28 border-b border-amber-800/30 pb-1 text-center font-mono text-xs text-on-surface-variant">
                    {selectedCertificate.earned.replace('Earned ', '')}
                  </div>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mt-1 text-center">Date Issued</span>
                </div>

                {/* Golden Badge Seal */}
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-20">
                    <span className="material-symbols-outlined text-amber-900 text-3xl font-black">workspace_premium</span>
                  </div>
                  <div className="absolute w-20 h-20 bg-amber-500/20 rounded-full animate-ping z-10"></div>
                </div>

                {/* Signature */}
                <div className="text-right">
                  <div className="w-28 border-b border-amber-800/30 pb-1 text-center font-serif text-xs text-amber-900 italic">
                    AI Coach
                  </div>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-wider block mt-1 text-center">Authorized Signature</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
