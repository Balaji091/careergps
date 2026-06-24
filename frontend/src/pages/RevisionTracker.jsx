import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AppContext } from '../context/AppContext';
import { AuthContext } from '../context/AuthContext';
import { RefreshCw, Shield, Loader2, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const RevisionTracker = () => {
  const { showToast, triggerReload } = useContext(AppContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState({ due: [], upcoming: [], mastered: [], notStarted: [] });

  const fetchRevisionQueue = async () => {
    try {
      const res = await api.get('/revision');
      setQueue(res.data);
    } catch (err) {
      showToast('Error loading revision deck', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionQueue();
  }, []);

  const handleCompleteRevision = async (revId) => {
    try {
      const res = await api.put(`/revision/complete/${revId}`);
      showToast(res.data.message, 'success');
      
      if (res.data.xpGained > 0) {
        showToast(`+${res.data.xpGained} XP awarded!`, 'success');
      }

      fetchRevisionQueue();
      triggerReload();
    } catch (err) {
      showToast('Failed to complete revision session', 'error');
    }
  };

  const handleScheduleManual = async (topicId) => {
    try {
      await api.post('/revision/schedule', { topicId });
      showToast('Concept scheduled in active recall queue!', 'success');
      fetchRevisionQueue();
      triggerReload();
    } catch (err) {
      showToast('Failed to schedule concept', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
      </div>
    );
  }

  const { due, upcoming, mastered, notStarted } = queue;

  return (
    <div className="space-y-6">
      
      {/* Deck Header */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="bg-purple-50 p-2 border border-purple-100 rounded-lg text-purple-600">
            <RefreshCw className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Spaced Repetition Deck</h2>
            <p className="text-xs text-[#6B7280]">
              Review topics at expanding intervals (1, 3, 7, 15, 30, 60 days) to lock in recall depth.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-l pl-6 border-[#E5E7EB] text-center shrink-0">
          <div>
            <span className="text-lg font-bold text-[#EF4444] block">{due.length}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Due Today</span>
          </div>
          <div className="border-l pl-6 border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#6B7280] block">{upcoming.length}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Upcoming</span>
          </div>
          <div className="border-l pl-6 border-[#E5E7EB]">
            <span className="text-lg font-bold text-[#22C55E] block">{mastered.length}</span>
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Mastered</span>
          </div>
        </div>
      </div>

      {/* DUE TODAY SECTION */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-[#EF4444] uppercase tracking-widest px-1">Due for Review Today ({due.length})</h3>
        {due.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center text-xs text-[#6B7280]">
            🎉 Awesome job! Your revision queue is completely clear for today.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {due.map((rev) => (
              <div key={rev._id} className="bg-white border border-[#EF4444] rounded-xl p-4 shadow-sm space-y-3.5 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <Link to={`/topic/${rev.topic?._id}`} className="font-bold text-xs sm:text-sm text-[#111827] hover:text-[#2563EB] transition-colors truncate pr-2">
                      {rev.topic?.name}
                    </Link>
                    <span className="text-[9px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                      STEP {rev.intervalStep}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280]">Module: {rev.subject?.name}</p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 text-xs">
                  <span className="text-[#EF4444] font-bold flex items-center text-[10px]">
                    <span className="w-1.5 h-1.5 bg-[#EF4444] rounded-full mr-1"></span>
                    Overdue
                  </span>

                  <button
                    onClick={() => handleCompleteRevision(rev._id)}
                    className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] shadow-sm flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Log Review</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPCOMING REVISIONS */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-[#6B7280] uppercase tracking-widest px-1">Upcoming Reviews ({upcoming.length})</h3>
        {upcoming.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {upcoming.slice(0, 6).map((rev) => (
              <div key={rev._id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-2.5 hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xs text-[#111827] truncate" title={rev.topic?.name}>{rev.topic?.name}</h4>
                <p className="text-[10px] text-[#6B7280]">Due Date: {new Date(rev.nextRevisionDate).toLocaleDateString()}</p>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] text-[#6B7280] font-bold">
                    <span>Recall progress</span>
                    <span>{Math.round((rev.intervalStep / 6) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2563EB] transition-all duration-300" style={{ width: `${(rev.intervalStep / 6) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center max-w-md mx-auto space-y-3 shadow-sm">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center mx-auto text-purple-600 border border-purple-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-[#111827]">No Upcoming Revisions</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                As you study new syllabus units and mark them completed, they will automatically schedule here for recall.
              </p>
            </div>
            <Link
              to="/roadmap"
              className="inline-block px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-colors shadow-sm"
            >
              Explore Roadmap
            </Link>
          </div>
        )}
      </div>

      {/* NOT STARTED REVISIONS */}
      {user?.profile?.autoScheduleRevision === false && notStarted.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-[#6B7280] tracking-widest uppercase px-1">Completed Topics Not Scheduled ({notStarted.length})</h3>
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm space-y-3">
            <p className="text-xs text-[#6B7280]">These topics have been completed, but have not yet been logged in active recall loops.</p>
            <div className="flex flex-wrap gap-2">
              {notStarted.map((rev) => (
                <button
                  key={rev._id}
                  onClick={() => handleScheduleManual(rev.topic?._id)}
                  className="px-3.5 py-1.5 border border-[#E5E7EB] hover:border-[#2563EB] hover:bg-blue-50/10 text-xs font-semibold rounded-lg text-[#6B7280] hover:text-[#2563EB] transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Schedule {rev.topic?.name}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MASTERED TOPICS */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-[#22C55E] uppercase tracking-widest px-1">Mastered concepts ({mastered.length})</h3>
        {mastered.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mastered.map((rev) => (
              <div key={rev._id} className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="space-y-0.5 truncate pr-3">
                  <h4 className="font-bold text-xs text-[#111827] truncate">{rev.topic?.name}</h4>
                  <span className="text-[9px] text-[#6B7280] block truncate">{rev.subject?.name}</span>
                </div>
                <div className="w-7 h-7 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-[#22C55E] shrink-0">
                  <Shield className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 text-center max-w-md mx-auto space-y-3 shadow-sm">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mx-auto text-[#22C55E] border border-green-100">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-xs text-[#111827]">No Mastered Concepts Yet</h4>
              <p className="text-[11px] text-[#6B7280] leading-relaxed">
                Complete all spacing recall steps (up to Day 60) for a topic in your deck to master it!
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-block px-3.5 py-1.5 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280] font-semibold rounded-lg text-[10px] transition-colors cursor-pointer"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

    </div>
  );
};

export default RevisionTracker;
