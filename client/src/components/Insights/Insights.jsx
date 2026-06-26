import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import CompassLoader from '../CompassLoader';
import InsightsChartSection from './InsightsChartSection';
import DrillDetailModal from './DrillDetailModal';
import InsightsDrillModal from './InsightsDrillModal';
import InsightsHeaderSummary from './InsightsHeaderSummary';
import InsightsSidebar from './InsightsSidebar';
import InsightsToast from './InsightsToast';
import QuizDetailModal from './QuizDetailModal';

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
  const [drillEvaluation, setDrillEvaluation] = useState(null);
  const [recentDrills, setRecentDrills] = useState([]);
  const [drillPage, setDrillPage] = useState(1);
  const [drillTotalPages, setDrillTotalPages] = useState(1);
  const [selectedDrillDetails, setSelectedDrillDetails] = useState(null);

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

  const formatChartDate = (date) => date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const formatDateRange = (startDate, endDate) => `${formatChartDate(startDate)}-${formatChartDate(endDate)}`;

  const fetchInsightsData = async () => {
    try {
      const [analyticsRes, roadmapRes, drillsRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/roadmap/active'),
        api.get('/drill/history', { params: { page: drillPage, limit: 4 } })
      ]);

      setReadinessPercent(analyticsRes.data.readinessScore || 0);
      setAnalyticsStats(analyticsRes.data.stats || {});
      setFocusAreas(analyticsRes.data.focusAreas || []);
      setHeatmapData(analyticsRes.data.heatmapData || []);
      setSubjects(roadmapRes.data?.subjects || []);
      setRecentQuizzes(analyticsRes.data.recentQuizzes || []);
      setRecentDrills(drillsRes.data.drills || []);
      setDrillTotalPages(drillsRes.data.totalPages || 1);
    } catch (err) {
      console.error('Error fetching insights data:', err);
      triggerToast('Failed to load insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, [drillPage]);

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
        dateLabel: formatChartDate(d),
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
        dateLabel: formatChartDate(d),
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
    const monthlyData = [];
    const today = new Date();

    for (let weekIdx = 0; weekIdx < 4; weekIdx++) {
      const startDate = new Date();
      startDate.setDate(today.getDate() - 27 + (weekIdx * 7));

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);

      monthlyData.push({
        label: `W${weekIdx + 1}`,
        dateLabel: formatDateRange(startDate, endDate),
        progress: 0,
        active: weekIdx === 3
      });
    }

    const dateMap = {};
    const topicsMap = {};
    heatmapData.forEach(h => {
      dateMap[h.date] = h.xpGained || 0;
      topicsMap[h.date] = h.topicsCompleted || 0;
    });

    const totalTopics = subjects.reduce((sum, s) => sum + (s.topicsCount || 0), 0) || 20;
    let maxWeeklyProgress = 20;
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
    setDrillEvaluation(null);
    try {
      const focusTitle = focusAreas[0]?.title || 'System Architecture';
      const genRes = await api.post('/drill/generate', {
        role: targetRole,
        source: 'insights',
        focusTitle,
        questions: [{
          question: `Explain the key trade-offs and production risks for ${focusTitle}.`,
          expectedAnswer: `A strong answer explains trade-offs, failure modes, operational risks, and practical mitigation for ${focusTitle}.`,
        }],
      });

      const evalRes = await api.put(`/drill/submit/${genRes.data._id}`, {
        answers: [drillAnswer],
      });

      const drill = evalRes.data;
      setDrillEvaluation({
        score: drill.evaluation?.score || 0,
        verdict: drill.evaluation?.verdict || 'Evaluated',
        strengths: drill.evaluation?.strengths || 'Good attempt.',
        improvements: drill.evaluation?.improvements || 'Keep practicing.',
        xpAwarded: drill.xpAwarded || 0,
      });
      setRecentDrills(prev => [drill, ...prev].slice(0, 4));
      setDrillPage(1);
      triggerToast(`Focused Drill complete! +${drill.xpAwarded || 0} XP`);
      reloadUserProfile();

      const analyticsRes = await api.get('/analytics');
      setReadinessPercent(analyticsRes.data.readinessScore || 0);
      setAnalyticsStats(analyticsRes.data.stats || {});
      setHeatmapData(analyticsRes.data.heatmapData || []);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to submit drill.');
      setDrillSuccess(false);
    }
  };
  if (loading) {
    return <CompassLoader />;
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
    <div className="space-y-4 fade-in relative select-none">
      <InsightsToast message={toastMessage} />
      <InsightsHeaderSummary
        analyticsStats={analyticsStats}
        navigate={navigate}
        timelineNodes={timelineNodes}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <InsightsChartSection
          chartRange={chartRange}
          currentChart={currentChart}
          focusAdvice={focusAdvice}
          focusTitle={focusTitle}
          hoveredBarIndex={hoveredBarIndex}
          hoveredXpBarIndex={hoveredXpBarIndex}
          setChartRange={setChartRange}
          setHoveredBarIndex={setHoveredBarIndex}
          setHoveredXpBarIndex={setHoveredXpBarIndex}
          setShowDrillModal={setShowDrillModal}
          weeklyXpChart={weeklyXpChart}
        />
        <InsightsSidebar
          displayedQuizzes={displayedQuizzes}
          drillPage={drillPage}
          drillTotalPages={drillTotalPages}
          growthSkills={growthSkills}
          navigate={navigate}
          recentDrills={recentDrills}
          setDrillPage={setDrillPage}
          setSelectedDrillDetails={setSelectedDrillDetails}
          setSelectedQuizDetails={setSelectedQuizDetails}
          setShowAllQuizzes={setShowAllQuizzes}
          showAllQuizzes={showAllQuizzes}
          strongestSkills={strongestSkills}
        />
      </div>

      <InsightsDrillModal
        drillAnswer={drillAnswer}
        drillEvaluation={drillEvaluation}
        drillSubmitting={drillSuccess}
        focusTitle={focusTitle}
        onClose={() => {
          setShowDrillModal(false);
          setDrillSuccess(false);
          setDrillAnswer('');
          setDrillEvaluation(null);
        }}
        onSubmit={handleDrillSubmit}
        setDrillAnswer={setDrillAnswer}
        show={showDrillModal}
      />
      <QuizDetailModal quiz={selectedQuizDetails} onClose={() => setSelectedQuizDetails(null)} />
      <DrillDetailModal drill={selectedDrillDetails} onClose={() => setSelectedDrillDetails(null)} />
    </div>
  );
};

export default Insights;
