import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { User, Mail, Settings, Loader2 } from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const { showToast, triggerReload } = useContext(AppContext);

  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('');
  const [dailyStudyTime, setDailyStudyTime] = useState(2);
  const [githubLink, setGithubLink] = useState('');
  const [linkedinLink, setLinkedinLink] = useState('');
  const [autoScheduleRevision, setAutoScheduleRevision] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.profile?.targetRole || '');
      setExperienceLevel(user.profile?.experienceLevel || '');
      setTargetTimeline(user.profile?.targetTimeline || '');
      setDailyStudyTime(user.profile?.dailyStudyTime || 2);
      setGithubLink(user.profile?.githubLink || '');
      setLinkedinLink(user.profile?.linkedinLink || '');
      setAutoScheduleRevision(user.profile?.autoScheduleRevision !== false);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        name,
        targetRole,
        experienceLevel,
        targetTimeline,
        dailyStudyTime: Number(dailyStudyTime),
        githubLink,
        linkedinLink,
        autoScheduleRevision,
      });
      showToast('Profile parameters updated successfully!', 'success');
      triggerReload();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Avatar and target stats left card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm flex flex-col items-center text-center space-y-3.5 lg:col-span-4 h-auto shrink-0">
          <div>
            <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] font-black text-xl overflow-hidden shadow-inner">
              {name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-[#111827]">{name}</h3>
            <span className="text-[10px] font-bold text-[#2563EB] uppercase bg-blue-50 px-2 py-0.5 rounded block w-fit mx-auto">
              Level {user?.level}
            </span>
          </div>

          <div className="w-full border-t border-gray-100 pt-3 space-y-2 text-xs text-left">
            <div className="flex justify-between font-semibold">
              <span className="text-[#6B7280]">Study Goal:</span>
              <span className="text-[#111827]">{user?.profile?.targetRole || 'Not Set'}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-[#6B7280]">Timeline:</span>
              <span className="text-[#111827]">{user?.profile?.targetTimeline || 'Not Set'}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-[#6B7280]">Total Score:</span>
              <span className="text-[#111827]">{user?.xp} XP</span>
            </div>
          </div>
        </div>

        {/* Setting parameters card */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex items-center space-x-2 text-[#111827] border-b pb-2 border-gray-50">
            <Settings className="w-4 h-4 text-[#6B7280]" />
            <h4 className="font-semibold text-sm">Profile Parameters</h4>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-xs text-[#111827]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-gray-400 bg-gray-50 cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Target Syllabus Role (Set at Onboarding)</label>
              <input
                type="text"
                disabled
                value={targetRole}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-gray-400 bg-gray-50 cursor-not-allowed outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Experience level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg bg-white text-xs font-semibold text-[#6B7280] outline-none cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Target Timeline (Set at Onboarding)</label>
              <input
                type="text"
                disabled
                value={targetTimeline}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-gray-400 bg-gray-50 cursor-not-allowed outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase">Daily Commitment (Hrs) (Set at Onboarding)</label>
              <input
                type="number"
                disabled
                value={dailyStudyTime}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-gray-400 bg-gray-50 cursor-not-allowed outline-none font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase flex items-center space-x-1">
                <GithubIcon className="w-3 h-3 text-[#6B7280]" />
                <span>GitHub Link</span>
              </label>
              <input
                type="url"
                value={githubLink}
                placeholder="https://github.com/yourusername"
                onChange={(e) => setGithubLink(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-xs text-[#111827]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[#6B7280] uppercase flex items-center space-x-1">
                <LinkedinIcon className="w-3 h-3 text-[#6B7280]" />
                <span>LinkedIn Link</span>
              </label>
              <input
                type="url"
                value={linkedinLink}
                placeholder="https://linkedin.com/in/yourusername"
                onChange={(e) => setLinkedinLink(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-xs text-[#111827]"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2 col-span-2">
              <input
                type="checkbox"
                id="autoScheduleRevision"
                checked={autoScheduleRevision}
                onChange={(e) => setAutoScheduleRevision(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#E5E7EB] text-[#2563EB] focus:ring-[#2563EB] focus:ring-offset-0 cursor-pointer bg-white"
              />
              <label htmlFor="autoScheduleRevision" className="text-[10px] font-bold text-[#6B7280] uppercase cursor-pointer select-none">
                Auto-Schedule Completed Topics to Revision Deck
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving parameters...</span>
              </>
            ) : (
              <span>Save Profile Parameters</span>
            )}
          </button>
        </div>

      </form>
      
    </div>
  );
};

export default Profile;
