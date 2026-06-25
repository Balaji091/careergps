import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUser, setGithubUser] = useState('');
  const [autoScheduleRevision, setAutoScheduleRevision] = useState(true);

  // Button States for Save Profile Changes
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, updating, saved
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '');
      setExperienceLevel(user.profile?.experienceLevel || '');
      setLinkedinUrl(user.profile?.linkedinLink || '');
      setGithubUser(user.profile?.githubLink || '');
      setAutoScheduleRevision(user.profile?.autoScheduleRevision ?? true);
    }
  }, [user]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const cleanName = name.trim();
    if (!cleanName) return 'U';
    const parts = cleanName.split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return cleanName.substring(0, 2).toUpperCase();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus('updating');
    setErrorMessage('');
    try {
      await updateProfile({
        name: displayName,
        experienceLevel,
        linkedinLink: linkedinUrl,
        githubLink: githubUser,
        autoScheduleRevision,
      });
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      setSaveStatus('idle');
      setErrorMessage(err.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-gutter fade-in">
      {/* Left Column: User Summary Card */}
      <aside className="lg:w-64 flex flex-col gap-stack-md shrink-0">
        <div className="bg-white p-6 rounded-xl border border-outline-variant/30 card-shadow flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2a14b4] to-[#4648d4] flex items-center justify-center text-white text-3xl font-black shadow-md">
              {getInitials(displayName || user?.name)}
            </div>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">{displayName || user?.name || 'User'}</h2>
          {/* <p className="text-on-surface-variant font-label-md text-label-md">{experienceLevel || 'Skill Level Not Set'}</p> */}
          
          <div className="mt-4 w-full pt-4 border-t border-outline-variant/20">
            <p className="text-xs font-bold uppercase tracking-wider text-outline mb-2">Target Role</p>
            <p className="text-primary font-semibold">{user?.profile?.targetRole || 'Not Set'}</p>
          </div>
        </div>
      </aside>

      {/* Right Column: Main Content Canvas */}
      <section className="flex-1 space-y-gutter">
        {/* Section Header */}
        <div className="mb-4">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Account Settings</h1>
          <p className="text-on-surface-variant font-body-md text-body-md">
            Manage your professional profile and growth trajectory.
          </p>
        </div>

        {/* Profile Settings Card */}
        <div className="bg-white rounded-xl border border-outline-variant/30 card-shadow overflow-hidden">
          <form className="p-6 md:p-8 space-y-stack-lg" onSubmit={handleSave}>
            {errorMessage && (
              <div className="p-4 bg-error/10 border border-error/20 text-error rounded-lg text-sm">
                {errorMessage}
              </div>
            )}
            
            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Display Name
                </label>
                <input
                  className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-body-md text-on-surface"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="font-label-md text-label-md text-on-surface block">
                  Experience Level
                </label>
                <div className="relative">
                  <select
                    className="w-full h-12 pl-4 pr-10 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none appearance-none font-body-md text-on-surface"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                    keyboard_arrow_down
                  </span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-label-md text-label-md text-on-surface border-b border-outline-variant/20 pb-2">
                Professional Network
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container shrink-0 text-outline">
                    <span className="material-symbols-outlined">link</span>
                  </div>
                  <input
                    className="flex-1 h-12 px-4 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-body-md text-on-surface"
                    placeholder="LinkedIn URL"
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface-container shrink-0 text-outline">
                    <span className="material-symbols-outlined">terminal</span>
                  </div>
                  <input
                    className="flex-1 h-12 px-4 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none font-body-md text-on-surface"
                    placeholder="GitHub Username"
                    type="text"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Locked Parameters */}
            <div className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl space-y-4 shadow-inner">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <h3 className="font-label-md text-label-md text-outline flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  Career Path Parameters (Locked)
                </h3>
                <span 
                  onClick={() => navigate('/onboarding/role')}
                  className="text-primary font-label-sm text-label-sm hover:underline cursor-pointer"
                >
                  Change Strategy
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
                <div className="opacity-50 grayscale pointer-events-none">
                  <label className="block text-xs font-bold text-outline uppercase mb-1">Target Role</label>
                  <div className="h-10 flex items-center px-3 bg-surface-container border border-outline-variant/50 rounded-lg text-sm text-on-surface">
                    {user?.profile?.targetRole || 'Not Set'}
                  </div>
                </div>
                <div className="opacity-50 grayscale pointer-events-none">
                  <label className="block text-xs font-bold text-outline uppercase mb-1">Daily Commitment</label>
                  <div className="h-10 flex items-center px-3 bg-surface-container border border-outline-variant/50 rounded-lg text-sm text-on-surface">
                    {user?.profile?.dailyStudyTime ? `${user.profile.dailyStudyTime} Hour${user.profile.dailyStudyTime > 1 ? 's' : ''}` : 'Not Set'}
                  </div>
                </div>
                <div className="opacity-50 grayscale pointer-events-none">
                  <label className="block text-xs font-bold text-outline uppercase mb-1">Timeline</label>
                  <div className="h-10 flex items-center px-3 bg-surface-container border border-outline-variant/50 rounded-lg text-sm text-on-surface">
                    {user?.profile?.targetTimeline || 'Not Set'}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  checked={autoScheduleRevision}
                  onChange={(e) => setAutoScheduleRevision(e.target.checked)}
                  className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary/20 accent-primary cursor-pointer"
                  id="autoScheduleRevision"
                  type="checkbox"
                />
              </div>
              <div className="text-sm select-none">
                <label className="font-semibold text-on-surface cursor-pointer" htmlFor="autoScheduleRevision">
                  Auto-schedule active recall revision cards
                </label>
                <p className="text-on-surface-variant mt-1">
                  Automatically generate spaced-repetition revision cards in your planner upon topic completion.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                className={`h-11 px-12 text-white font-bold rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center ${
                  saveStatus === 'saved'
                    ? 'bg-green-600'
                    : 'bg-gradient-to-tr from-[#2a14b4] to-[#4648d4]'
                }`}
                disabled={saveStatus === 'updating'}
              >
                {saveStatus === 'updating' && 'Updating...'}
                {saveStatus === 'saved' && 'Profile Updated!'}
                {saveStatus === 'idle' && 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Support Area */}
        <div className="flex justify-between items-center px-4 flex-wrap gap-4">
          <span className="text-label-sm text-outline font-semibold">
            Last updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
          </span>
        </div>
      </section>
    </div>
  );
};

export default Settings;
