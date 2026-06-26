import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CompassLoader from '../CompassLoader';
import { getGoalDrillQuestions } from '../../utils';
import ActiveRecallSection from './ActiveRecallSection';
import PlannerDrillModal from './PlannerDrillModal';
import PlannerHeader from './PlannerHeader';
import PlannerToast from './PlannerToast';
import SyllabusSection from './SyllabusSection';

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
  const [drillEvaluation, setDrillEvaluation] = useState(null);

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
    setDrillEvaluation(null);

    try {
      // Generate drill on backend then submit answers for AI evaluation
      const genRes = await api.post('/drill/generate', {
        role: targetRole,
        source: 'planner',
        focusTitle: dynamicDrill.modalTitle,
        questions: [
          { question: dynamicDrill.q1, expectedAnswer: dynamicDrill.q1Placeholder },
          { question: dynamicDrill.q2, expectedAnswer: dynamicDrill.q2Placeholder },
        ],
      });
      const drillId = genRes.data._id;

      // Submit user answers for AI evaluation
      const evalRes = await api.put(`/drill/submit/${drillId}`, {
        answers: [drillAnswers.q1, drillAnswers.q2],
        questions: [dynamicDrill.q1, dynamicDrill.q2]
      });

      const drill = evalRes.data;
      setDrillEvaluation({
        score: drill.evaluation?.score || 0,
        verdict: drill.evaluation?.verdict || 'Evaluated',
        strengths: drill.evaluation?.strengths || 'Good attempt.',
        improvements: drill.evaluation?.improvements || 'Keep practicing.',
        xpAwarded: drill.xpAwarded || 0
      });

      reloadUserProfile();
      triggerToast(`Drill evaluated! Score: ${drill.evaluation?.score || 0}% • +${drill.xpAwarded || 0} XP`);

      // Refresh daily XP
      const analyticsRes = await api.get('/analytics');
      const todayStr = getLocalDateString();
      const todayEntry = (analyticsRes.data.heatmapData || []).find(h => h.date === todayStr);
      setXp(todayEntry ? todayEntry.xpGained : 0);
    } catch (err) {
      console.error(err);
      triggerToast('Drill submitted! (AI evaluation unavailable)');
      // Fallback: close modal on error after delay
      setTimeout(() => {
        setShowDrillModal(false);
        setDrillSubmitted(false);
        setDrillAnswers({ q1: '', q2: '' });
        setDrillEvaluation(null);
      }, 1500);
    }

    setDrillSubmitted(false);
  };

  const handleCloseDrillModal = () => {
    setShowDrillModal(false);
    setDrillSubmitted(false);
    setDrillAnswers({ q1: '', q2: '' });
    setDrillEvaluation(null);
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
    return <CompassLoader />;
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
      <PlannerToast message={toastMessage} />
      <PlannerHeader
        formattedDate={getFormattedDate()}
        maxXp={maxXp}
        streak={streak}
        targetRole={targetRole}
        userLevel={userLevel}
        xp={xp}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <SyllabusSection
          getTaskDescription={getTaskDescription}
          handleAddCustomTask={handleAddCustomTask}
          handleDeleteTask={handleDeleteTask}
          handleToggleTask={handleToggleTask}
          newTaskName={newTaskName}
          remainingCount={remainingCount}
          setNewTaskName={setNewTaskName}
          tasks={tasks}
        />
        <ActiveRecallSection
          activeRecallCard={activeRecallCard}
          atRiskCount={atRiskCount}
          dueRevisions={dueRevisions}
          handleRecallAnswer={handleRecallAnswer}
          handleSkipRecall={handleSkipRecall}
          learnedCount={learnedCount}
          navigate={navigate}
          overallMastery={overallMastery}
          recallDueCount={recallDueCount}
          reviewingCount={reviewingCount}
          setShowDrillModal={setShowDrillModal}
          setShowRecallAnswer={setShowRecallAnswer}
          showRecallAnswer={showRecallAnswer}
          targetRole={targetRole}
        />
      </div>

      <PlannerDrillModal
        drillAnswers={drillAnswers}
        drillEvaluation={drillEvaluation}
        drillSubmitted={drillSubmitted}
        dynamicDrill={dynamicDrill}
        onClose={handleCloseDrillModal}
        onSubmit={handleDrillSubmit}
        setDrillAnswers={setDrillAnswers}
        show={showDrillModal}
        targetRole={targetRole}
      />
    </div>
  );
};

export default Planner;
