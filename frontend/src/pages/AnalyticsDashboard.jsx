import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import CircularProgress from '../components/CircularProgress';
import { BarChart3, TrendingUp, AlertTriangle, Target, Loader2 } from 'lucide-react';

const AnalyticsDashboard = () => {
  const { showToast } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      setStats(res.data);
    } catch (err) {
      showToast('Error loading analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const { readinessScore, stats: userStats, focusAreas, historicalReadiness } = stats;

  const readinessBreakdown = [
    { name: 'Roadmap Completion', value: userStats.roadmapCompletion, weight: 30, color: 'bg-[#2563EB]' },
    { name: 'Technical Q&A Answers', value: userStats.interviewQuestionsCompleted, weight: 25, color: 'bg-[#22C55E]' },
    { name: 'Spaced Repetition Loops', value: userStats.revisionCompletion, weight: 20, color: 'bg-purple-500' },
    { name: 'Notes Coverage', value: userStats.notesCoverage, weight: 15, color: 'bg-[#F59E0B]' },
    { name: 'Streak Consistency', value: userStats.consistencyScore, weight: 10, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Analytics Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Gauge card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col items-center justify-center text-center space-y-3.5 md:col-span-1">
          <h3 className="font-bold text-xs text-[#6B7280] uppercase tracking-wider">Readiness Score</h3>
          <CircularProgress value={readinessScore || 0} size={110} strokeWidth={8} />
          <p className="text-[11px] text-[#6B7280] max-w-[200px] leading-relaxed">
            Your overall score based on course progress and active learning habits.
          </p>
        </div>

        {/* Breakdown bar list */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm md:col-span-2 space-y-4">
          <h3 className="font-semibold text-sm text-[#111827] border-b pb-2 border-gray-50">Readiness Score Breakdown</h3>
          <div className="space-y-3">
            {readinessBreakdown.map((item) => (
              <div key={item.name} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-semibold text-[#6B7280]">
                  <span>{item.name} (Weight: {item.weight}%)</span>
                  <span className="text-[#111827]">{item.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} transition-all duration-300`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Stats details & History */}
      <div className="grid md:grid-cols-3 gap-6">
        
        {/* Areas to improve */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-[#EF4444] border-b pb-2 border-gray-50">
              <AlertTriangle className="w-4.5 h-4.5" />
              <h4 className="font-semibold text-sm text-[#111827]">Focus Areas</h4>
            </div>
            <ul className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {focusAreas?.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs text-[#6B7280] leading-relaxed font-semibold">
                  <span className="w-4 h-4 rounded-full bg-red-50 text-[#EF4444] border border-red-100 flex items-center justify-center font-bold shrink-0 text-[10px]">!</span>
                  <div>
                    <span className="font-bold text-[#111827] block">{item.title}</span>
                    <span>{item.recommendation}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quiz Performance */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-purple-600 border-b pb-2 border-gray-50">
              <Target className="w-4.5 h-4.5" />
              <h4 className="font-semibold text-sm text-[#111827]">Quiz Performance</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-[#6B7280]">
                <span>Quizzes Completed</span>
                <span className="font-bold text-[#111827] text-sm">{userStats.totalQuizzesTaken || 0}</span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-semibold text-[#6B7280]">
                  <span>Average Quiz Accuracy</span>
                  <span className="text-[#111827] font-bold">{userStats.averageQuizScore || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300" 
                    style={{ width: `${userStats.averageQuizScore || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#6B7280] italic leading-normal border-t pt-2 border-gray-50 font-medium">
            Quizzes are generated dynamically. Achieve at least 80% accuracy for interview readiness checks!
          </p>
        </div>

        {/* Historical Readiness */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-[#22C55E] border-b pb-2 border-gray-50">
              <TrendingUp className="w-4.5 h-4.5" />
              <h4 className="font-semibold text-sm text-[#111827]">Readiness Progress</h4>
            </div>
            {historicalReadiness?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No history recorded yet. Keep studying!</p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {historicalReadiness?.map((hist, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-gray-50">
                    <span className="text-[#6B7280] font-semibold">{hist.date}</span>
                    <span className="font-bold text-[#2563EB] bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded">{hist.score}% Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsDashboard;
