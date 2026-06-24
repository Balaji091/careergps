import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  ArrowRight,
  Shield,
  Award,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  HelpCircle,
  Terminal,
  Activity
} from 'lucide-react';
import Logo from '../components/Logo';

const LandingPage = () => {
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, text: 'Complete React Fiber module', completed: true },
    { id: 2, text: 'Draft system design note: CDN', completed: false },
    { id: 3, text: 'Attempt 3 mock interview questions', completed: false },
  ]);

  const toggleDemoTask = (id) => {
    setDemoTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const features = [
    {
      title: 'Personalized AI Roadmaps',
      description: 'Career GPS AI analyzes your dream role, timeline parameters, and experience level to generate custom subject roadmaps.',
      icon: <Sparkles className="w-4 h-4 text-blue-600" />
    },
    {
      title: 'Spaced Repetition Engine',
      description: 'Automatic daily scheduling loops based on memory science algorithms to guarantee long-term concept recall.',
      icon: <Award className="w-4 h-4 text-blue-600" />
    },
    {
      title: 'Active Markdown Editor',
      description: 'A dedicated workspace to write structured notes, complete with AI helpers to generate flashcards and code summaries.',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />
    },
    {
      title: 'Technical Interview Simulator',
      description: 'Test your conceptual depth with technical questions, save confidence logs, and access advanced interview modules.',
      icon: <Shield className="w-4 h-4 text-blue-600" />
    },
    {
      title: 'Daily Planner Kanban',
      description: 'Clear, prioritized daily workflows that dynamically combine your roadmap lessons, tasks, and revision cards.',
      icon: <Calendar className="w-4 h-4 text-blue-600" />
    },
    {
      title: 'Consistency Heatmap',
      description: 'Visualize your daily study duration, completed tasks, and current streaks with a GitHub-style activity graph.',
      icon: <CheckCircle className="w-4 h-4 text-blue-600" />
    }
  ];

  const careerPaths = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'AI Engineer', 'Data Engineer', 'DevOps Engineer', 'GATE CSE', 'System Architect'
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-[#111827] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-800">
      {/* HEADER NAVBAR */}
      <header className="border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm sticky top-0 z-50 h-16 flex items-center shrink-0 shadow-sm">
        <div className="max-w-[1400px] mx-auto w-full px-6 flex items-center justify-between">
          <Link to="/">
            <Logo textSize="text-base" />
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-xs font-semibold text-[#6B7280] hover:text-[#111827] px-3 py-2 rounded-lg transition-colors hover:bg-slate-50">
              Sign In
            </Link>
            <Link to="/register" className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/25">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-white border-b border-[#E5E7EB] py-16 md:py-24 px-6 relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headline & Action details */}
          <div className="lg:col-span-6 text-left space-y-6">
            <span className="inline-flex items-center space-x-1.5 bg-blue-50/80 border border-blue-100 text-[#2563EB] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>The Learning OS for Engineers</span>
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827] leading-[1.15]">
              Accelerate Your <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Engineering Career</span>
            </h1>
            <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed max-w-xl">
              Don't just watch tutorials. Generate custom structured roadmaps, take active Markdown notes with AI utilities, manage automated recall schedules, and track your job-readiness analytics on one clean dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link to="/register" className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 text-xs">
                <span>Start Custom Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="px-6 py-3 border border-[#E5E7EB] bg-white hover:bg-slate-50 text-[#6B7280] hover:text-[#111827] font-semibold rounded-lg transition-all text-center text-xs shadow-sm">
                Explore Features
              </a>
            </div>
          </div>

          {/* Right Column: Live Interactive Mock Dashboard Widget */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Decorative back-glowing circular radial */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-2xl blur-2xl opacity-80 pointer-events-none"></div>

              {/* Main Interactive Container */}
              <div className="relative bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden flex flex-col w-full">
                {/* Header Mock bar */}
                <div className="bg-slate-50 border-b border-[#E5E7EB] px-4 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="text-[10px] text-gray-400 font-bold ml-2 font-mono">dashboard_mockup_v2.app</span>
                  </div>
                  <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-600 font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></span>
                    <span>LIVE DEMO</span>
                  </span>
                </div>

                {/* Body elements */}
                <div className="p-5 space-y-4 bg-white">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl shadow-sm text-center">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">Readiness</span>
                      <div className="mt-1 flex items-center justify-center space-x-1">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-base font-extrabold text-[#111827]">84%</span>
                      </div>
                    </div>
                    
                    <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl shadow-sm text-center">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">Streak</span>
                      <div className="mt-1 flex items-center justify-center space-x-1 text-amber-600">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span className="text-base font-extrabold text-[#111827]">12 Days</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl shadow-sm text-center">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider block">Revisions</span>
                      <div className="mt-1 flex items-center justify-center space-x-1 text-indigo-600">
                        <Award className="w-3.5 h-3.5" />
                        <span className="text-base font-extrabold text-[#111827]">3 Due</span>
                      </div>
                    </div>
                  </div>

                  {/* Checklist demo */}
                  <div className="border border-[#E5E7EB] rounded-xl p-4 space-y-3 bg-white shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                      <h4 className="text-[10px] font-extrabold text-[#111827] uppercase tracking-widest flex items-center space-x-1.5">
                        <Terminal className="w-3.5 h-3.5 text-blue-600" />
                        <span>Interactive Planner Checklist</span>
                      </h4>
                      <span className="text-[9px] text-gray-400">Click to Toggle</span>
                    </div>
                    
                    <div className="space-y-2">
                      {demoTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => toggleDemoTask(t.id)}
                          className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer transition-all border ${
                            t.completed
                              ? 'bg-blue-50/30 border-blue-100 text-gray-400 line-through'
                              : 'bg-white border-slate-100 hover:border-blue-300 text-gray-700 shadow-sm'
                          }`}
                        >
                          {t.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-300 hover:text-blue-500 shrink-0" />
                          )}
                          <span className="text-xs font-semibold select-none truncate">{t.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini-Chatbot window mockup */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center space-x-2 border-b pb-1.5 border-slate-200">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-[9px] font-bold text-[#111827] uppercase tracking-wider">AI Topic Tutor chatbot</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] bg-white border border-slate-200 p-2 rounded-lg text-gray-700 font-medium leading-relaxed">
                        "Provide a commented code snippet of React state hooks."
                      </p>
                      <p className="text-[10px] bg-blue-50/50 border border-blue-100 p-2 rounded-lg text-gray-600 leading-relaxed font-mono whitespace-pre-wrap">
                        {`const [state, setState] = useState(initial); // Simple hook`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROADMAP TARGET SELECTORS */}
      <section className="py-12 bg-slate-50 border-b border-[#E5E7EB] px-6">
        <div className="max-w-[1400px] mx-auto w-full text-center space-y-6">
          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-widest">Select your targeted career path</h3>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {careerPaths.map((path) => (
              <span
                key={path}
                className="bg-white border border-[#E5E7EB] text-[#111827] text-xs font-semibold px-4 py-2 rounded-full shadow-sm hover:border-[#2563EB] hover:text-[#2563EB] cursor-default transition-all duration-150 transform hover:-translate-y-0.5"
              >
                {path}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID SECTION */}
      <section id="features" className="py-20 bg-white border-b border-[#E5E7EB] px-6">
        <div className="max-w-[1400px] mx-auto w-full space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">Structured Learning, Engineered</h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">Everything you need to eliminate study fragmentation and measure conceptual capability.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="bg-white border border-[#E5E7EB] p-6 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all space-y-4 group"
              >
                <div className="bg-blue-50 border border-blue-100 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                  {feat.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-[#111827] tracking-tight group-hover:text-blue-600 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-slate-50 border-b border-[#E5E7EB] px-6">
        <div className="max-w-[1400px] mx-auto w-full space-y-16">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">How Career GPS Works</h2>
            <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">Four structured stages to lock in engineering competency.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: '01', title: 'Pick your career target', desc: 'Choose your track, target timeline parameters, experience level, and daily time availability.' },
              { step: '02', title: 'Generate structured roadmap', desc: 'The AI model builds an interactive module containing Subjects, Units, and Topics tailored for you.' },
              { step: '03', title: 'Execute study sessions', desc: 'Access notes workspaces, toggle AI chatbot assists, test stepwise quizzes, and complete review tasks.' },
              { step: '04', title: 'Track readiness metrics', desc: 'Watch your metrics increase on the analytics layout and sustain consistency to build your learning streak.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between hover:shadow transition-shadow">
                <span className="text-2xl font-black text-blue-100 font-mono tracking-widest">{step.step}</span>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-[#111827] tracking-tight">{step.title}</h4>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white mt-auto py-10 px-6 border-t border-[#E5E7EB]">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-center text-xs text-[#6B7280] gap-6">
          <Link to="/">
            <Logo textSize="text-sm" />
          </Link>
          <p>&copy; 2026 Career GPS Learning Operating System. All rights reserved.</p>
          <div className="flex space-x-6 font-semibold">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
