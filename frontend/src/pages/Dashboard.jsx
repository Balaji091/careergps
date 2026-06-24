import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import Heatmap from '../components/Heatmap';
import CircularProgress from '../components/CircularProgress';
import {
  Compass,
  Zap,
  TrendingUp,
  BookOpen,
  CheckSquare,
  AlertCircle,
  Award,
  ChevronRight,
  Loader2,
  Calendar,
  RefreshCw,
  Clock,
  Play,
  Flame,
  ArrowRight,
  CheckSquare2,
  Square
} from 'lucide-react';

const Dashboard = () => {
  const { user, reloadUserProfile } = useContext(AuthContext);
  const { showToast, roadmap, reloadTrigger, triggerReload } = useContext(AppContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [plannerTasks, setPlannerTasks] = useState([]);
  const [revisionsDue, setRevisionsDue] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, plannerRes, revisionRes] = await Promise.all([
        api.get('/analytics'),
        api.get('/planner'),
        api.get('/revision'),
      ]);
      setStats(analyticsRes.data);
      setPlannerTasks(plannerRes.data);
      setRevisionsDue(revisionRes.data.due || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err.message);
      showToast('Error loading stats', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (!user.profile?.targetRole) {
        navigate('/onboarding');
        return;
      }
      fetchDashboardData();
    }
  }, [user, reloadTrigger]);

  const handleToggleTask = async (taskId, currentStatus) => {
    const nextStatus = currentStatus === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.put(`/planner/${taskId}`, { status: nextStatus });
      setPlannerTasks(prev =>
        prev.map(t => (t._id === taskId ? { ...t, status: nextStatus } : t))
      );
      if (res.data.xpGained > 0) {
        showToast(`Task completed! +${res.data.xpGained} XP awarded.`, 'success');
      } else if (res.data.xpGained < 0) {
        showToast(`Task unmarked. XP adjusted.`, 'info');
      }
      reloadUserProfile();
      fetchDashboardData();
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center max-w-md mx-auto space-y-4 shadow-sm mt-10">
        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto text-[#2563EB]">
          <Compass className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-[#111827]">Setup Your Career Syllabus</h2>
        <p className="text-xs text-[#6B7280] leading-relaxed">
          Build a learning roadmap, practice daily interview questions, and measure your job readiness.
        </p>
        <Link
          to="/onboarding"
          className="inline-block px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
        >
          Initialize Onboarding Wizard
        </Link>
      </div>
    );
  }

  const { readinessScore, stats: userStats, achievements, heatmapData, recommendedNextSteps } = stats || {};

  return (
    <div className="space-y-6">
      
      {/* ROW 1: METRICS SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Readiness Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Job Readiness</span>
            <span className="text-xl font-extrabold text-[#111827]">{readinessScore || 0}%</span>
          </div>
          <div className="shrink-0 flex justify-center items-center">
            <CircularProgress value={readinessScore || 0} size={52} strokeWidth={5} />
          </div>
        </div>

        {/* Metric 2: Streak count */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Current Streak</span>
            <span className="text-xl font-extrabold text-[#111827]">{userStats?.streakCount || 0} Days</span>
          </div>
          <div className="w-9 h-9 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center text-[#F59E0B] shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* Metric 3: Study Hours */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Study Hours</span>
            <span className="text-xl font-extrabold text-[#111827]">{userStats?.studyHours || 0} Hrs</span>
          </div>
          <div className="w-9 h-9 bg-green-50 border border-green-100 rounded-lg flex items-center justify-center text-[#22C55E] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Quiz Avg Score */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider block">Avg Quiz Score</span>
            <span className="text-xl font-extrabold text-[#111827]">{userStats?.averageQuizScore || 0}%</span>
          </div>
          <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-[#2563EB] shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ROW 2: TODAY'S TASKS & REVISIONS DUE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Tasks Checklist */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-[#6B7280]" />
                <h4 className="font-semibold text-sm text-[#111827]">Today's Action Tasks</h4>
              </div>
              <Link to="/planner" className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center space-x-0.5">
                <span>Go to board</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {plannerTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">All daily planner goals completed!</div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {plannerTasks.map((task) => (
                  <div key={task._id} className="flex items-center justify-between p-2 border border-gray-100 hover:border-gray-200 rounded-lg bg-gray-50/20 transition-all">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task._id, task.status)}
                        className="text-[#6B7280] hover:text-[#2563EB] transition-colors shrink-0"
                      >
                        {task.status === 'Completed' ? (
                          <CheckSquare2 className="w-4 h-4 text-[#22C55E]" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                      <span className={`text-xs text-[#111827] truncate ${task.status === 'Completed' ? 'line-through text-gray-400 font-medium' : 'font-semibold'}`}>
                        {task.name}
                      </span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                      task.type === 'learn' ? 'bg-blue-50 text-[#2563EB]' :
                      task.type === 'revise' ? 'bg-purple-50 text-purple-600' :
                      task.type === 'interview' ? 'bg-green-50 text-[#22C55E]' : 'bg-gray-100 text-[#6B7280]'
                    }`}>
                      {task.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Revisions Due Today */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm lg:col-span-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-[#6B7280]" />
                <h4 className="font-semibold text-sm text-[#111827]">Active Recall Due</h4>
              </div>
              <Link to="/revision" className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center space-x-0.5">
                <span>View deck</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {revisionsDue.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">No revisions scheduled for today.</div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {revisionsDue.slice(0, 4).map((rev) => (
                  <div key={rev._id} className="flex justify-between items-center p-2 border border-gray-100 hover:border-gray-200 rounded-lg bg-gray-50/20">
                    <span className="text-xs font-semibold text-[#111827] truncate flex-1 pr-3" title={rev.topic?.name}>
                      {rev.topic?.name}
                    </span>
                    <span className="text-[8px] font-bold text-[#EF4444] bg-red-50 px-1.5 py-0.5 rounded shrink-0">
                      Step {rev.intervalStep}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: ACHIEVEMENTS & AI RECOMMENDATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Achievements Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm lg:col-span-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
              <Award className="w-4 h-4 text-[#6B7280]" />
              <h4 className="font-semibold text-sm text-[#111827]">Badges Unlocked</h4>
            </div>

            {achievements?.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">Study and unlock custom achievements!</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                {achievements?.map((ach) => (
                  <div key={ach._id} className="p-2 border border-gray-100 rounded-lg text-center bg-[#F8FAFC] flex flex-col items-center">
                    <span className="text-lg mb-1" title={ach.description}>🏆</span>
                    <h5 className="text-[10px] font-bold text-[#111827] truncate w-full">{ach.title}</h5>
                    <span className="text-[8px] text-[#6B7280] truncate w-full">{ach.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm lg:col-span-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-2.5">
              <Zap className="w-4 h-4 text-[#6B7280]" />
              <h4 className="font-semibold text-sm text-[#111827]">AI Next Study Targets</h4>
            </div>

            {recommendedNextSteps?.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#6B7280]">AI suggestions generating as you complete modules...</div>
            ) : (
              <ul className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {recommendedNextSteps?.slice(0, 3).map((stepText, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-xs font-semibold text-[#111827] p-2 bg-[#F8FAFC] border border-gray-100 rounded-lg">
                    <ArrowRight className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
                    <span className="leading-normal">{stepText}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ROW 4: HEATMAP */}
      <Heatmap history={heatmapData || []} />

      {/* ROW 5: SUBJECT PROGRESS CARDS */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-[#6B7280] uppercase tracking-widest px-1">Syllabus Subjects Coverage</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmap.subjects?.map((subj) => {
            const isCompleted = subj.status === 'completed';
            const isInProgress = subj.status === 'in_progress';

            return (
              <div
                key={subj._id}
                onClick={() => navigate(`/subject/${subj._id}`)}
                className="bg-white border border-[#E5E7EB] hover:border-[#2563EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-semibold text-sm text-[#111827] group-hover:text-[#2563EB] transition-colors truncate pr-2">
                    {subj.name}
                  </h5>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                    isCompleted ? 'bg-green-50 text-[#22C55E]' :
                    isInProgress ? 'bg-blue-50 text-[#2563EB]' : 'bg-gray-100 text-[#6B7280]'
                  }`}>
                    {subj.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-[#6B7280] font-medium">
                  <span>⏳ {subj.estimatedTime}</span>
                  <span>📚 {subj.completedCount || 0} / {subj.topicsCount || 0} Topics</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#6B7280]">
                    <span>Completion</span>
                    <span>{subj.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-[#22C55E]' : 'bg-[#2563EB]'}`}
                      style={{ width: `${subj.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
