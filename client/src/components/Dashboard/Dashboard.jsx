import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import CompassLoader from '../CompassLoader';
import ActiveSubjectsSection from './ActiveSubjectsSection';
import BadgesSection from './BadgesSection';
import CertificateModal from './CertificateModal';
import DashboardFab from './DashboardFab';
import DashboardStatsGrid from './DashboardStatsGrid';
import DrillModal from './DrillModal';
import HeatmapSection from './HeatmapSection';
import ReadinessCard from './ReadinessCard';
import ToastAlert from './ToastAlert';

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
    if (drillSuccess || !drillAnswer.trim()) return;
    setDrillSuccess(true);
    try {
      const focusTitle = focusAreas[0]?.title || 'System Architecture';
      const role = user?.profile?.targetRole || 'Lead Engineer';
      const genRes = await api.post('/drill/generate', {
        role,
        source: 'dashboard',
        focusTitle,
        questions: [{
          question: `Explain the key trade-offs and production risks for ${focusTitle}.`,
          expectedAnswer: `A strong answer explains trade-offs, failure modes, operational risks, and practical mitigation for ${focusTitle}.`,
        }],
      });
      const evalRes = await api.put(`/drill/submit/${genRes.data._id}`, {
        answers: [drillAnswer],
      });
      triggerToast(`Focused Drill complete! +${evalRes.data.xpAwarded || 0} XP`);
      
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
    return <CompassLoader />;
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

  // Get dynamic readiness advice
  const readinessAdvice = focusAreas.length > 0
    ? `Focus on "${focusAreas[0].title}" to boost your score to the next percentile.`
    : 'All focus areas check out! Run mock interviews and practice boards.';

  return (
    <div className="space-y-stack-lg fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <ReadinessCard readinessAdvice={readinessAdvice} readinessPercent={readinessPercent} />
        <DashboardStatsGrid
          analyticsStats={analyticsStats}
          checklist={checklist}
          completedCount={completedCount}
          modulesLeft={modulesLeft}
          targetRole={targetRole}
          toggleChecklistItem={toggleChecklistItem}
          user={user}
        />
      </div>

      <HeatmapSection heatmapData={heatmapData} />
      <BadgesSection badgeItems={badgeItems} onSelectCertificate={setSelectedCertificate} />
      <ActiveSubjectsSection navigate={navigate} subjects={subjects} />
      <DashboardFab navigate={navigate} />
      <ToastAlert message={toastMessage} />
      <DrillModal
        drillAnswer={drillAnswer}
        drillSuccess={drillSuccess}
        focusAreas={focusAreas}
        onClose={() => setShowDrillModal(false)}
        onSubmit={handleDrillSubmit}
        setDrillAnswer={setDrillAnswer}
        show={showDrillModal}
      />
      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        user={user}
      />
    </div>
  );
};

export default Dashboard;
