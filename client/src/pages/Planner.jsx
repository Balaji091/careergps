import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const getGoalDrillQuestions = (role) => {
  const cleanRole = (role || '').toLowerCase();
  if (cleanRole.includes('front') || cleanRole.includes('react') || cleanRole.includes('ui') || cleanRole.includes('design')) {
    return {
      q1: 'Explain the difference between React useMemo and useCallback hooks, and when to use each.',
      q1Placeholder: 'useMemo memoizes the returned value of a function, while useCallback memoizes the function definition itself.',
      q2: 'What is the benefit of CSS Container Queries over Media Queries?',
      q2Placeholder: 'Container queries allow styling elements based on the width of their parent container rather than the viewport.',
      modalTitle: `${role} Frontend Drill`
    };
  }
  if (cleanRole.includes('back') || cleanRole.includes('node') || cleanRole.includes('db') || cleanRole.includes('data')) {
    return {
      q1: 'Explain the difference between optimistic concurrency control and pessimistic locking in databases.',
      q1Placeholder: 'Optimistic locking checks version fields before update. Pessimistic locking locks the records directly.',
      q2: 'What is the CAP theorem and how does it affect distributed database design?',
      q2Placeholder: 'States a distributed system can guarantee at most two out of three: Consistency, Availability, and Partition Tolerance.',
      modalTitle: `${role} Backend Drill`
    };
  }
  return {
    q1: 'Explain the difference between AWS ALB (Application Load Balancer) and NLB (Network Load Balancer).',
    q1Placeholder: 'ALB operates at Layer 7 (HTTP/path routing). NLB operates at Layer 4 (high throughput TCP/UDP).',
    q2: 'What is the main benefit of using AWS Route 53 Geolocation routing policy?',
    q2Placeholder: 'Routes traffic based on user location to improve latency or show localized content.',
    modalTitle: `${role} Architect Drill`
  };
};

const Planner = () => {
  const navigate = useNavigate();
  const { user, reloadUserProfile } = useContext(AuthContext);
  const targetRole = user?.profile?.targetRole || 'Software Engineer';
  const dynamicDrill = getGoalDrillQuestions(targetRole);
  const [tasks, setTasks] = useState([]);
  const [dueRevisions, setDueRevisions] = useState([]);
  const [upcomingRevisions, setUpcomingRevisions] = useState([]);
  const [masteredRevisions, setMasteredRevisions] = useState([]);
  const [notStartedRevisions, setNotStartedRevisions] = useState([]);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const maxXp = 600;
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');

  // Spaced Repetition (Active Recall) State
  const [recallIndex, setRecallIndex] = useState(0);
  const [showRecallAnswer, setShowRecallAnswer] = useState(false);

  // Fallback cards if no revisions are scheduled/due in database
  const fallbackRecallCards = [
    {
      q: "What is the main difference between CAP theorem and PACELC theorem?",
      a: "CAP states that in case of Partition, you choose Consistency or Availability. PACELC builds on this: If Partition (P), choose Availability (A) or Consistency (C); Else (E), choose Latency (L) or Consistency (C)."
    },
    {
      q: "What is the role of a dead-letter queue (DLQ) in message brokers?",
      a: "A DLQ stores messages that cannot be processed successfully by consumers after a certain number of retries, allowing developers to isolate and debug issues without blocking queues."
    },
    {
      q: "What are the trade-offs of using optimistic locking vs pessimistic locking?",
      a: "Optimistic locking assumes conflicts are rare and verifies data consistency at write time (using version numbers). Pessimistic locking locks data rows eagerly, which prevents concurrency but avoids conflicts completely."
    }
  ];

  // Premium Drill Modal State
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [drillAnswers, setDrillAnswers] = useState({ q1: '', q2: '' });
  const [drillSubmitted, setDrillSubmitted] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchPlannerData = async () => {
    try {
      const [plannerRes, revisionRes, analyticsRes] = await Promise.all([
        api.get('/planner'),
        api.get('/revision'),
        api.get('/analytics')
      ]);

      setTasks(plannerRes.data);
      setDueRevisions(revisionRes.data.due || []);
      setUpcomingRevisions(revisionRes.data.upcoming || []);
      setMasteredRevisions(revisionRes.data.mastered || []);
      setNotStartedRevisions(revisionRes.data.notStarted || []);
      setStreak(analyticsRes.data.stats.streakCount || 0);

      // Find today's XP gained from analytics history
      const todayStr = getLocalDateString();
      const heatmap = analyticsRes.data.heatmapData || [];
      const todayEntry = heatmap.find(h => h.date === todayStr);
      setXp(todayEntry ? todayEntry.xpGained : 0);
    } catch (err) {
      console.error('Error fetching planner data:', err);
      triggerToast('Failed to load daily planner.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

  const handleAddCustomTask = async (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    try {
      const res = await api.post('/planner', {
        name: newTaskName,
        type: 'custom'
      });
      setTasks(prev => [...prev, res.data]);
      setNewTaskName('');
      triggerToast('Custom task added to your schedule!');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to add custom task.');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.put(`/planner/${taskId}`, { status: nextStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t));
      
      if (res.data.xpGained !== 0) {
        reloadUserProfile();
        triggerToast(`Task updated! XP change: ${res.data.xpGained > 0 ? '+' : ''}${res.data.xpGained} XP`);
        
        // Refresh local stats
        const analyticsRes = await api.get('/analytics');
        setStreak(analyticsRes.data.stats.streakCount || 0);
        const todayStr = getLocalDateString();
        const heatmap = analyticsRes.data.heatmapData || [];
        const todayEntry = heatmap.find(h => h.date === todayStr);
        setXp(todayEntry ? todayEntry.xpGained : 0);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update task.');
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation(); // prevent toggling task completed status
    try {
      await api.delete(`/planner/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      triggerToast('Task deleted from daily syllabus.');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to delete task.');
    }
  };

  const handleRecallAnswer = async (rating) => {
    const isDynamic = dueRevisions.length > 0;
    const currentCard = isDynamic ? dueRevisions[recallIndex] : null;

    if (rating === 'easy') {
      if (isDynamic && currentCard) {
        try {
          const res = await api.put(`/revision/complete/${currentCard._id}`);
          triggerToast(`Revision completed! +${res.data.xpGained || 10} XP`);
          reloadUserProfile();

          // Remove card locally
          setDueRevisions(prev => prev.filter((_, idx) => idx !== recallIndex));
          setRecallIndex(0);

          // Refresh local stats
          const analyticsRes = await api.get('/analytics');
          setStreak(analyticsRes.data.stats.streakCount || 0);
          const todayStr = getLocalDateString();
          const heatmap = analyticsRes.data.heatmapData || [];
          const todayEntry = heatmap.find(h => h.date === todayStr);
          setXp(todayEntry ? todayEntry.xpGained : 0);
        } catch (err) {
          console.error(err);
          triggerToast('Failed to complete revision card.');
        }
      } else {
        setXp(x => Math.min(maxXp, x + 30));
        triggerToast('Recall Mastered! +30 XP (Simulated)');
        setRecallIndex(prev => (prev + 1) % fallbackRecallCards.length);
      }
    } else {
      if (isDynamic && currentCard) {
        try {
          // Study again resets active step and schedules for tomorrow
          await api.post('/revision/schedule', { topicId: currentCard.topic._id });
          triggerToast('Marked to study again tomorrow!');
          setDueRevisions(prev => prev.filter((_, idx) => idx !== recallIndex));
          setRecallIndex(0);
        } catch (err) {
          console.error(err);
          triggerToast('Failed to reschedule card.');
        }
      } else {
        triggerToast('Marked for review soon.');
        setRecallIndex(prev => (prev + 1) % fallbackRecallCards.length);
      }
    }

    setShowRecallAnswer(false);
  };

  const handleSkipRecall = () => {
    setShowRecallAnswer(false);
    const len = dueRevisions.length > 0 ? dueRevisions.length : fallbackRecallCards.length;
    setRecallIndex(prev => (prev + 1) % len);
    triggerToast('Skipped active recall card.');
  };

  const handleDrillSubmit = async (e) => {
    e.preventDefault();
    setDrillSubmitted(true);

    try {
      // Log task in DB
      const taskRes = await api.post('/planner', {
        name: `${dynamicDrill.modalTitle}: Custom Practice Drill`,
        type: 'custom'
      });

      // Mark it completed immediately
      const completeRes = await api.put(`/planner/${taskRes.data._id}`, { status: 'Completed' });

      // Add to local checklist
      setTasks(prev => [...prev, completeRes.data.task]);

      triggerToast(`${targetRole} drill completed! +${completeRes.data.xpGained || 10} XP earned`);
      reloadUserProfile();

      // Refresh daily XP
      const analyticsRes = await api.get('/analytics');
      const todayStr = getLocalDateString();
      const todayEntry = (analyticsRes.data.heatmapData || []).find(h => h.date === todayStr);
      setXp(todayEntry ? todayEntry.xpGained : 0);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to log drill rewards.');
    }

    setTimeout(() => {
      setShowDrillModal(false);
      setDrillSubmitted(false);
      setDrillAnswers({ q1: '', q2: '' });
    }, 2000);
  };

  const getTaskDescription = (task) => {
    switch (task.type) {
      case 'learn':
        return 'Study core lessons and concepts for this syllabus topic.';
      case 'revise':
        return 'Review spaced-repetition cards to reinforce retention.';
      case 'review_notes':
        return 'Write or review smart study notes for this syllabus topic.';
      case 'interview':
        return 'Complete mock interview prep to build answers.';
      case 'custom':
      default:
        return 'Custom scheduled learning task.';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
      </div>
    );
  }

  const remainingCount = tasks.filter(t => t.status !== 'Completed').length;
  const userLevel = user?.level || 1;

  // Choose between dynamic due revision cards and fallback questions
  const activeRecallCard = dueRevisions.length > 0
    ? {
        q: `What is the core technical definition and engineering details of the topic "${dueRevisions[recallIndex]?.topic?.name}"?`,
        a: dueRevisions[recallIndex]?.topic?.cachedLearnContent?.definition || dueRevisions[recallIndex]?.topic?.summary || 'No definition available. Open the topic workspace to review.'
      }
    : fallbackRecallCards[recallIndex];

  const recallDueCount = dueRevisions.length;

  const learnedCount = masteredRevisions.length + upcomingRevisions.length + dueRevisions.length;
  const reviewingCount = upcomingRevisions.length + dueRevisions.length;
  const atRiskCount = dueRevisions.length;
  const totalRevisionsCount = learnedCount + notStartedRevisions.length;
  const overallMastery = totalRevisionsCount > 0 ? Math.round((masteredRevisions.length / totalRevisionsCount) * 100) : 0;

  return (
    <div className="space-y-stack-lg fade-in relative select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-xl z-50 animate-bounce flex items-center gap-2 border border-outline-variant/30">
          <span className="material-symbols-outlined">stars</span>
          <span className="font-label-md text-label-md">{toastMessage}</span>
        </div>
      )}

      {/* Header section with Stats */}
      <header className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight font-bold">Daily Planner</h2>
          <p className="font-body-md text-body-md text-on-surface-variant font-medium">
            {getFormattedDate()} • Level {userLevel} {targetRole} Path
          </p>
        </div>

        {/* XP / Streak Widget */}
        <div className="flex gap-stack-md shrink-0">
          {/* Streak Card */}
          <div className="tonal-card p-4 rounded-xl flex items-center gap-4 bg-white min-w-[140px] border border-outline-variant/20 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <span className="material-symbols-outlined filled-icon">local_fire_department</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">STREAK</p>
              <p className="font-headline-md text-headline-md text-on-surface leading-none font-black">
                {streak} <span className="text-label-sm font-semibold">days</span>
              </p>
            </div>
          </div>

          {/* XP Card */}
          <div className="tonal-card p-4 rounded-xl flex items-center gap-4 bg-white min-w-[160px] border border-outline-variant/20 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined filled-icon">bolt</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">DAILY XP</p>
              <p className="font-headline-md text-headline-md text-on-surface leading-none font-black">
                {xp} <span className="text-label-sm font-semibold">/ {maxXp}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Syllabus Checklist Tasks */}
        <section className="lg:col-span-7 space-y-stack-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Today's Syllabus</h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm font-bold">
              {remainingCount} Tasks Remaining
            </span>
          </div>

          {/* Add custom task bar */}
          <form onSubmit={handleAddCustomTask} className="flex gap-2 bg-white p-3 rounded-xl border border-outline-variant/20 shadow-sm">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Add a custom task to today's schedule..."
              className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary/50 text-on-surface"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add</span>
            </button>
          </form>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div 
                  key={task._id} 
                  className={`tonal-card rounded-xl border border-outline-variant/20 bg-white transition-all shadow-sm flex items-start gap-4 p-5 ${
                    isCompleted ? 'bg-surface-container-low/50 opacity-70' : 'hover:border-primary/30 cursor-pointer'
                  }`}
                  onClick={() => handleToggleTask(task._id, task.status)}
                >
                  {/* Checkbox circle indicator */}
                  <div 
                    className={`mt-1 w-6 h-6 border-2 rounded flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted 
                        ? 'bg-primary border-primary' 
                        : 'border-outline-variant hover:border-primary'
                    }`}
                  >
                    {isCompleted && (
                      <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={`font-body-lg font-bold text-on-surface ${isCompleted ? 'line-through text-on-surface-variant/50' : ''}`}>
                        {task.name}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0">
                        {!isCompleted && (
                          <span className="font-label-sm text-label-sm text-primary font-bold">
                            +10 XP
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteTask(task._id, e)}
                          className="p-1 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant hover:text-error cursor-pointer"
                          title="Delete task"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
                      {getTaskDescription(task)}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface-variant rounded text-xs font-semibold uppercase tracking-wider">
                        {task.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Spaced Repetition (Active Recall) */}
        <section className="lg:col-span-5 space-y-stack-md">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Active Recall</h3>
            <span className="font-label-md text-label-md text-on-surface-variant font-bold">{recallDueCount} Due Today</span>
          </div>

          <div className="space-y-4">
            {dueRevisions.length > 0 ? (
              /* Knowledge drill card */
              <div className="tonal-card p-6 rounded-xl border-l-4 border-l-secondary bg-white relative overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="absolute top-0 right-0 p-4">
                  <span className="material-symbols-outlined text-secondary/20 text-4xl">psychology</span>
                </div>
                <h5 className="font-label-md text-label-md text-secondary mb-2 tracking-wider font-bold">KNOWLEDGE DRILL</h5>
                <p className="font-body-lg font-bold text-on-surface pr-10 leading-snug">
                  {activeRecallCard.q}
                </p>

                {/* Answer revealing block */}
                {showRecallAnswer && (
                  <div className="mt-4 p-4 bg-surface-container rounded-lg text-sm leading-relaxed text-on-surface border border-outline-variant/30 animate-in slide-in-from-top-2 duration-300">
                    <p className="leading-relaxed">{activeRecallCard.a}</p>
                    
                    {/* Rating selections */}
                    <div className="mt-4 flex gap-2 justify-end">
                      <button 
                        onClick={() => handleRecallAnswer('again')}
                        className="px-3 py-1 bg-white hover:bg-red-50 text-error border border-error-container text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Study Again
                      </button>
                      <button 
                        onClick={() => handleRecallAnswer('easy')}
                        className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-container transition-colors cursor-pointer"
                      >
                        Easy ({dueRevisions.length > 0 ? '+10 XP' : '+30 XP'})
                      </button>
                    </div>
                  </div>
                )}

                {!showRecallAnswer && (
                  <div className="mt-6 flex gap-3">
                    <button 
                      onClick={() => setShowRecallAnswer(true)}
                      className="flex-1 bg-primary text-white py-2 rounded-lg font-label-md text-label-md font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Show Answer
                    </button>
                    <button 
                      onClick={handleSkipRecall}
                      className="px-4 bg-surface-container-high text-on-surface rounded-lg hover:bg-surface-container-highest transition-colors flex items-center justify-center cursor-pointer"
                    >
                      <span className="material-symbols-outlined">skip_next</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="tonal-card p-6 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/20 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-secondary/10 text-secondary flex items-center justify-center rounded-xl">
                  <span className="material-symbols-outlined text-2xl animate-pulse">check_circle</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">All caught up!</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
                    You have no spaced-repetition knowledge drills scheduled for today. Complete new topics in your pathway to build your active recall deck.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/roadmap')}
                  className="px-6 h-10 bg-secondary text-white font-bold text-label-md rounded-lg shadow-md hover:bg-secondary-container transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">explore</span>
                  Study New Topics
                </button>
              </div>
            )}

            {/* Retention progress card */}
            <div className="tonal-card p-6 rounded-xl space-y-4 bg-white border border-outline-variant/20 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-on-surface font-bold">Retention Mastery</span>
                <span className="font-label-sm text-label-sm text-primary font-bold">{overallMastery}% Overall</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="progress-gradient h-full rounded-full shadow-sm" style={{ width: `${overallMastery}%` }}></div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="text-center">
                  <p className="font-headline-md text-headline-md text-primary font-black">{learnedCount}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">Learned</p>
                </div>
                <div className="text-center">
                  <p className="font-headline-md text-headline-md text-on-surface font-black">{reviewingCount}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">Reviewing</p>
                </div>
                <div className="text-center">
                  <p className="font-headline-md text-headline-md text-on-surface font-black">{atRiskCount}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant font-bold">At Risk</p>
                </div>
              </div>
            </div>

            {/* Premium Goals Prep Card */}
            <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined filled-icon text-yellow-400">stars</span>
                  <span className="font-label-md text-label-md tracking-wider font-bold">PREMIUM GOAL</span>
                </div>
                <h4 className="font-headline-md text-headline-md leading-tight mb-2 font-bold">{targetRole} Certification Prep</h4>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                  Complete your daily custom diagnostic drills today to stay on track for your {targetRole} path.
                </p>
                <button 
                  onClick={() => setShowDrillModal(true)}
                  className="w-full py-3 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-md active:scale-95 duration-100 cursor-pointer"
                >
                  Start Drills
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Premium AWS solutions architect drill modal */}
      {showDrillModal && (
        <div className="fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/30 animate-in slide-in-from-bottom-6 duration-300">
            <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-indigo-900 text-white">
              <h3 className="font-headline-md flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-yellow-400">stars</span>
                {dynamicDrill.modalTitle}
              </h3>
              <button 
                className="material-symbols-outlined hover:bg-indigo-800 p-1 rounded-full transition-all text-white cursor-pointer" 
                onClick={() => setShowDrillModal(false)}
              >
                close
              </button>
            </div>
            
            <form onSubmit={handleDrillSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface">
                  Question 1: {dynamicDrill.q1}
                </label>
                <textarea 
                  value={drillAnswers.q1}
                  onChange={(e) => setDrillAnswers(prev => ({ ...prev, q1: e.target.value }))}
                  required
                  placeholder={dynamicDrill.q1Placeholder}
                  className="w-full h-20 bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none font-body-md"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-on-surface">
                  Question 2: {dynamicDrill.q2}
                </label>
                <textarea 
                  value={drillAnswers.q2}
                  onChange={(e) => setDrillAnswers(prev => ({ ...prev, q2: e.target.value }))}
                  required
                  placeholder={dynamicDrill.q2Placeholder}
                  className="w-full h-20 bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 text-sm focus:outline-none focus:border-primary resize-none font-body-md"
                />
              </div>

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
                  disabled={drillSubmitted}
                  className="bg-indigo-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-950 transition-all active:scale-95 shadow-md disabled:bg-slate-400 cursor-pointer"
                >
                  <span>{drillSubmitted ? 'Submitting Answers...' : `Submit ${targetRole} Drills`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
