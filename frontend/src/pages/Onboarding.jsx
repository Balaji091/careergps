import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import api from '../services/api';
import { Check, Compass, ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2, Circle } from 'lucide-react';

const Onboarding = () => {
  const { user, setUser } = useContext(AuthContext);
  const { showToast, triggerReload } = useContext(AppContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [targetRole, setTargetRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [targetTimeline, setTargetTimeline] = useState('');
  const [customTimeline, setCustomTimeline] = useState('');
  const [dailyStudyTime, setDailyStudyTime] = useState(2);
  const [customStudyTime, setCustomStudyTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorStep, setGeneratorStep] = useState(0);

  // Redirect if already onboarded
  useEffect(() => {
    if (user && user.profile?.targetRole) {
      navigate('/dashboard');
    }
  }, [user]);

  const roles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'Data Engineer', 'Data Scientist', 'AI Engineer', 'DevOps Engineer',
    'SAP Developer', 'Cyber Security Engineer', 'GATE CSE', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const timelines = ['3 Months', '6 Months', '12 Months', 'Custom'];
  const hours = [1, 2, 4, 6, 'Custom'];

  // Generator simulation steps
  const generationSteps = [
    'Connecting to CGPS AI...',
    'Generating roadmap...',
    'Building milestones...',
    'Scheduling revision loops...',
    'Preparing interview plan...'
  ];

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setGeneratorStep((prev) => {
          if (prev < generationSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGeneratorStep(0);
    const finalTimeline = targetTimeline === 'Custom' ? customTimeline : targetTimeline;
    const finalHours = dailyStudyTime === 'Custom' ? Number(customStudyTime) : Number(dailyStudyTime);

    try {
      await api.post('/roadmap/onboard', {
        targetRole,
        experienceLevel,
        targetTimeline: finalTimeline || '6 Months',
        dailyStudyTime: finalHours || 2,
      });

      // Update local user auth details
      const profileRes = await api.get('/auth/profile');
      setUser(profileRes.data);
      
      showToast('Career Roadmap synthesized successfully!', 'success');
      triggerReload();
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate roadmap. Please try again.', 'error');
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="relative w-12 h-12 mx-auto">
            <Loader2 className="w-12 h-12 text-[#2563EB] animate-spin" />
            <Sparkles className="w-5 h-5 text-[#2563EB] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#111827]">Assembling Curriculum</h2>
            <p className="text-xs text-[#6B7280]">Our AI engine is compiling your learning operating system</p>
          </div>

          {/* Step Progress Checklist */}
          <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F8FAFC] text-left space-y-3.5">
            {generationSteps.map((stepName, idx) => {
              const isCompleted = generatorStep > idx;
              const isCurrent = generatorStep === idx;

              return (
                <div key={idx} className="flex items-center space-x-3 text-xs">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                  )}
                  <span className={`font-semibold ${
                    isCompleted ? 'text-gray-500 line-through' :
                    isCurrent ? 'text-[#111827]' : 'text-gray-400'
                  }`}>
                    {stepName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-2xl w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Wizard Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
            <span>Step {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300 ease-out"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: TARGET ROLE */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-left space-y-1 border-b border-[#E5E7EB] pb-3">
              <h2 className="text-lg font-bold text-[#111827]">Select your target engineering role</h2>
              <p className="text-xs text-[#6B7280]">Choose the career profile you are actively aiming for</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => setTargetRole(r)}
                  className={`p-3 border text-xs font-bold rounded-lg transition-all text-center flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                    targetRole === r
                      ? 'border-[#2563EB] bg-blue-50/30 text-[#2563EB]'
                      : 'border-[#E5E7EB] hover:border-gray-300 text-[#6B7280] bg-white'
                  }`}
                >
                  <Compass className={`w-4 h-4 ${targetRole === r ? 'text-[#2563EB]' : 'text-gray-400'}`} />
                  <span>{r}</span>
                </button>
              ))}
            </div>

            {targetRole === 'Other' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#6B7280] uppercase">Specify custom role</label>
                <input
                  type="text"
                  placeholder="e.g. Cloud Solutions Architect"
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
              <button
                disabled={!targetRole}
                onClick={handleNext}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE LEVEL */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-left space-y-1 border-b border-[#E5E7EB] pb-3">
              <h2 className="text-lg font-bold text-[#111827]">What is your current experience level?</h2>
              <p className="text-xs text-[#6B7280]">This calibrates AI explanation and curriculum complexities</p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setExperienceLevel(lvl)}
                  className={`p-4 border text-center rounded-lg transition-all flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                    experienceLevel === lvl
                      ? 'border-[#2563EB] bg-blue-50/30 text-[#2563EB]'
                      : 'border-[#E5E7EB] hover:border-gray-300 text-[#6B7280] bg-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    experienceLevel === lvl ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-[#6B7280]'
                  }`}>
                    {lvl.charAt(0)}
                  </div>
                  <span className="font-bold text-xs text-[#111827]">{lvl}</span>
                  <span className="text-[10px] text-[#6B7280] leading-relaxed">
                    {lvl === 'Beginner' && 'Simplified analogies & fundamentals.'}
                    {lvl === 'Intermediate' && 'Detailed architectures & setups.'}
                    {lvl === 'Advanced' && 'Advanced edge-cases & scaling rules.'}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280] font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={!experienceLevel}
                onClick={handleNext}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TARGET TIMELINE */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-left space-y-1 border-b border-[#E5E7EB] pb-3">
              <h2 className="text-lg font-bold text-[#111827]">What is your target timeline?</h2>
              <p className="text-xs text-[#6B7280]">Total duration planned to become career-ready</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {timelines.map((time) => (
                <button
                  key={time}
                  onClick={() => setTargetTimeline(time)}
                  className={`p-3 border font-bold text-xs rounded-lg transition-all text-center flex flex-col justify-center items-center space-y-2 cursor-pointer ${
                    targetTimeline === time
                      ? 'border-[#2563EB] bg-blue-50/30 text-[#2563EB]'
                      : 'border-[#E5E7EB] hover:border-gray-300 text-[#6B7280] bg-white'
                  }`}
                >
                  <span className="text-base">📅</span>
                  <span>{time}</span>
                </button>
              ))}
            </div>

            {targetTimeline === 'Custom' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#6B7280] uppercase">Specify Custom Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 5 Months or 45 Days"
                  value={customTimeline}
                  onChange={(e) => setCustomTimeline(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280] font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={!targetTimeline || (targetTimeline === 'Custom' && !customTimeline)}
                onClick={handleNext}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DAILY STUDY HOURS */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-left space-y-1 border-b border-[#E5E7EB] pb-3">
              <h2 className="text-lg font-bold text-[#111827]">How many hours can you study daily?</h2>
              <p className="text-xs text-[#6B7280]">Allows AI to partition subject learning speeds</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {hours.map((h) => (
                <button
                  key={h}
                  onClick={() => setDailyStudyTime(h)}
                  className={`p-3 border font-bold text-xs rounded-lg transition-all text-center flex flex-col justify-center items-center space-y-2 cursor-pointer ${
                    dailyStudyTime === h
                      ? 'border-[#2563EB] bg-blue-50/30 text-[#2563EB]'
                      : 'border-[#E5E7EB] hover:border-gray-300 text-[#6B7280] bg-white'
                  }`}
                >
                  <span className="text-base">⚡</span>
                  <span>{h === 'Custom' ? 'Custom' : `${h} Hr`}</span>
                </button>
              ))}
            </div>

            {dailyStudyTime === 'Custom' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#6B7280] uppercase">Specify Daily Hours</label>
                <input
                  type="number"
                  placeholder="e.g. 3 or 5"
                  value={customStudyTime}
                  onChange={(e) => setCustomStudyTime(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm text-[#111827] outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280] font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={!dailyStudyTime || (dailyStudyTime === 'Custom' && !customStudyTime)}
                onClick={handleNext}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION & AI RUN */}
        {step === 5 && (
          <div className="space-y-5 text-center">
            <div className="text-left space-y-1 border-b border-[#E5E7EB] pb-3">
              <h2 className="text-lg font-bold text-[#111827]">Ready to compile your Career Plan?</h2>
              <p className="text-xs text-[#6B7280]">Review your parameters before generating</p>
            </div>

            <div className="border border-[#E5E7EB] rounded-xl bg-[#F8FAFC] p-4 text-left space-y-3 text-xs max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-semibold">Target Career Path</span>
                <span className="font-bold text-[#111827]">{targetRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-semibold">Current Skill Level</span>
                <span className="font-bold text-[#111827]">{experienceLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-semibold">Timeline Target</span>
                <span className="font-bold text-[#111827]">
                  {targetTimeline === 'Custom' ? customTimeline : targetTimeline}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-semibold">Daily Commitment</span>
                <span className="font-bold text-[#111827]">
                  {dailyStudyTime === 'Custom' ? `${customStudyTime} Hours` : `${dailyStudyTime} Hours`}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B7280] max-w-sm mx-auto leading-relaxed">
              Upon clicking generate, CGPS AI will build a comprehensive, structured learning sequence of subjects and topics tailored specifically for your profile.
            </p>

            <div className="flex justify-between pt-4 border-t border-[#E5E7EB] max-w-md mx-auto">
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280] font-semibold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleGeneratePlan}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Generate Plan</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
