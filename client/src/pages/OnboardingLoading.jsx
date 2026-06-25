import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const OnboardingLoading = () => {
  const navigate = useNavigate();
  const { reloadUserProfile } = useContext(AuthContext);
  const [progress, setProgress] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onboard = async () => {
      try {
        const targetRole = localStorage.getItem('onboarding_targetRole') || 'DevOps Engineer';
        const targetTimeline = localStorage.getItem('onboarding_targetTimeline') || '6 Months';
        const dailyStudyTime = Number(localStorage.getItem('onboarding_dailyStudyTime')) || 2;
        const experienceLevel = 'Intermediate'; // Default

        await api.post('/roadmap/onboard', {
          targetRole,
          experienceLevel,
          targetTimeline,
          dailyStudyTime,
        });

        // Sync local user details
        await reloadUserProfile();
        setApiDone(true);
      } catch (err) {
        console.error('Failed to generate roadmap:', err);
        setError(err.response?.data?.message || 'Failed to generate roadmap. Please try again.');
      }
    };

    onboard();
  }, []);

  useEffect(() => {
    if (error) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        if (prev >= 90 && !apiDone) {
          return 90;
        }
        // Increment progress by a random amount for a natural loading feel
        const increment = Math.floor(Math.random() * 8) + 2;
        return Math.min(100, prev + increment);
      });
    }, 200);

    return () => clearInterval(timer);
  }, [apiDone, error]);

  useEffect(() => {
    if (progress === 100 && apiDone) {
      const delay = setTimeout(() => {
        navigate('/roadmap', { state: { onboardingCompleted: true } });
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [progress, apiDone, navigate]);

  return (
    <div className="bg-surface text-on-surface font-body-md overflow-hidden min-h-screen flex flex-col items-center justify-center relative select-none">
      {/* Subtle Background Atmospheric Gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-secondary/5 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-lg px-margin-mobile md:px-0 flex flex-col items-center">
        {/* Brand Identity Anchor */}
        <div className="mb-12 animate-pulse-subtle flex justify-center">
          <Logo className="scale-125 md:scale-150" textSize="text-2xl" />
        </div>

        {/* Main Loading Message */}
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-headline-md text-primary mb-2">
            {error ? 'Generation Failed' : 'Personalizing your career path...'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant opacity-70">
            {error ? error : 'Our algorithms are tailoring a growth roadmap based on your unique technical profile.'}
          </p>
          {error && (
            <button
              onClick={() => navigate('/onboarding/role')}
              className="mt-6 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full shadow-lg hover:shadow-primary/20 hover:opacity-90 active:scale-95 transition-transform"
            >
              Go Back to Start
            </button>
          )}
        </div>

        {/* Progress Section */}
        <div className="w-full bg-surface-container rounded-full h-2 mb-8 overflow-hidden relative border border-outline-variant/10">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="shimmer-bg absolute inset-0 opacity-30"></div>
          </div>
          {/* Progress Glow Head */}
          <div
            className="absolute h-4 w-4 bg-primary blur-md rounded-full -top-1 transition-all duration-300"
            style={{ left: `${progress}%` }}
          ></div>
        </div>

        {/* Status Feed */}
        <div className="w-full space-y-4 px-4">
          {/* Status 1 */}
          <div className="flex items-center space-x-3 transition-opacity duration-300">
            <span
              className={`material-symbols-outlined text-[20px] ${
                progress >= 30 ? 'text-primary animate-none' : 'text-primary/40 animate-spin'
              }`}
              style={{ fontVariationSettings: progress >= 30 ? "'FILL' 1" : "'FILL' 0" }}
            >
              {progress >= 30 ? 'check_circle' : 'sync'}
            </span>
            <span
              className={`font-label-md text-label-md ${
                progress >= 30 ? 'text-on-surface font-bold' : 'text-on-surface-variant'
              }`}
            >
              Analyzing skill gaps...
            </span>
          </div>

          {/* Status 2 */}
          <div
            className={`flex items-center space-x-3 transition-opacity duration-300 ${
              progress >= 30 ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                progress >= 65 ? 'text-primary animate-none' : progress >= 30 ? 'text-primary animate-spin' : 'text-on-surface-variant'
              }`}
              style={{ fontVariationSettings: progress >= 65 ? "'FILL' 1" : "'FILL' 0" }}
            >
              {progress >= 65 ? 'check_circle' : progress >= 30 ? 'sync' : 'circle'}
            </span>
            <span
              className={`font-label-md text-label-md ${
                progress >= 65 ? 'text-on-surface font-bold' : 'text-on-surface-variant'
              }`}
            >
              Generating custom labs...
            </span>
          </div>

          {/* Status 3 */}
          <div
            className={`flex items-center space-x-3 transition-opacity duration-300 ${
              progress >= 65 ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                progress >= 95 ? 'text-primary animate-none' : progress >= 65 ? 'text-primary animate-spin' : 'text-on-surface-variant'
              }`}
              style={{ fontVariationSettings: progress >= 95 ? "'FILL' 1" : "'FILL' 0" }}
            >
              {progress >= 95 ? 'check_circle' : progress >= 65 ? 'sync' : 'circle'}
            </span>
            <span
              className={`font-label-md text-label-md ${
                progress >= 95 ? 'text-on-surface font-bold' : 'text-on-surface-variant'
              }`}
            >
              Mapping mentorship network...
            </span>
          </div>
        </div>

        {/* Information Card */}
        <div className="mt-16 w-full p-6 bg-surface-container-lowest rounded-xl border border-surface-container shadow-sm flex items-start space-x-4 hover:translate-y-[-2px] hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="bg-primary/10 p-3 rounded-lg text-primary">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div>
            <h4 className="font-label-md text-label-md text-primary mb-1 uppercase tracking-wider">
              Did you know?
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Engineers who complete structured lab paths are 40% more likely to transition into Senior Lead roles within 18 months.
            </p>
          </div>
        </div>
      </main>

      {/* Footer Identity */}
      <footer className="fixed bottom-12 w-full text-center">
        <div className="flex items-center justify-center space-x-2 text-on-surface-variant/40">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span className="font-label-sm text-label-sm uppercase tracking-widest">
            Secure Infrastructure
          </span>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLoading;
