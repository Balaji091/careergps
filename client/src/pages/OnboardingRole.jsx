import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const OnboardingRole = () => {
  const navigate = useNavigate();

  // Input value (user can type anything)
  const [targetRole, setTargetRole] = useState('DevOps Engineer');

  const roles = [
    { name: 'Frontend Engineer', icon: 'web', color: 'secondary' },
    { name: 'Backend Engineer', icon: 'dns', color: 'secondary' },
    { name: 'Full Stack Developer', icon: 'code', color: 'secondary' },
    { name: 'React Developer', icon: 'developer_mode', color: 'secondary' },
    { name: 'AI Engineer', icon: 'smart_toy', color: 'primary' },
    { name: 'Machine Learning Engineer', icon: 'neurology', color: 'secondary' },
    { name: 'Data Scientist', icon: 'monitoring', color: 'secondary' },
    { name: 'DevOps Engineer', icon: 'terminal', color: 'primary' },
    { name: 'Cloud Engineer', icon: 'cloud', color: 'secondary' },
    { name: 'Cyber Security Engineer', icon: 'security', color: 'secondary' },
    { name: 'Software Engineer', icon: 'computer', color: 'secondary' },
    { name: 'Engineering Manager', icon: 'groups', color: 'secondary' },
  ];

  const handleRoleSelect = (roleName) => {
    setTargetRole(roleName);
  };

  const handleContinue = () => {
    if (!targetRole.trim()) return;

    localStorage.setItem('onboarding_targetRole', targetRole.trim());
    navigate('/onboarding/timeline');
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center select-none">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-14 border-b border-outline-variant/10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Logo textSize="text-base" />
        </Link>

        <div className="flex items-center gap-1">
          <div className="h-1.5 w-8 rounded-full bg-primary"></div>
          <div className="h-1.5 w-8 rounded-full bg-surface-container-highest"></div>
          <div className="h-1.5 w-8 rounded-full bg-surface-container-highest"></div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-[480px] px-margin-mobile pt-24 pb-32 flex flex-col gap-stack-lg overflow-y-auto custom-scrollbar">
        {/* Heading */}
        <section className="fade-in">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            What's your target role?
          </h1>

          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter your dream role or choose one of the popular engineering roles below.
          </p>
        </section>

        {/* Input */}
        <div className="fade-in">
          <label className="block mb-2 font-label-md text-on-surface">
            Target Role
          </label>

          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. AI Engineer, Flutter Developer..."
            className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-body-md text-on-surface placeholder:text-on-surface-variant/60"
          />
        </div>

        {/* Suggested Roles */}
        <section className="fade-in">
          <h2 className="font-label-lg text-on-surface mb-3">
            Suggested Roles
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => {
              const isSelected = targetRole.trim().toLowerCase() === role.name.toLowerCase();

              return (
                <button
                  key={role.name}
                  onClick={() => handleRoleSelect(role.name)}
                  className={`role-chip flex flex-col items-start p-4 rounded-xl transition-all duration-200 active:scale-95 text-left w-full ${
                    isSelected
                      ? 'bg-primary-fixed text-primary border-2 border-primary ring-4 ring-primary/5'
                      : 'bg-surface-container-lowest border border-outline-variant hover:border-primary/50 group'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                      isSelected
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary/10 text-secondary group-hover:bg-secondary/20'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontVariationSettings: isSelected
                          ? "'FILL' 1"
                          : "'FILL' 0",
                      }}
                    >
                      {role.icon}
                    </span>
                  </div>

                  <div className="flex justify-between items-center w-full">
                    <span className="font-label-md text-label-md text-on-surface">
                      {role.name}
                    </span>

                    {isSelected && (
                      <span className="material-symbols-outlined text-[20px] text-primary">
                        check_circle
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Info */}
        <div className="p-4 bg-secondary-fixed text-on-secondary-fixed-variant rounded-xl flex gap-3 fade-in">
          <span className="material-symbols-outlined shrink-0 text-secondary">
            info
          </span>

          <p className="font-body-sm text-body-sm">
            Type any career goal or pick one of the suggested roles. We'll create
            a personalized learning roadmap tailored to your target role.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full max-w-[480px] bg-surface/80 backdrop-blur-md px-margin-mobile py-6 flex flex-col gap-4 z-50 border-t border-outline-variant/10">
        <button
          onClick={handleContinue}
          disabled={!targetRole.trim()}
          className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </footer>
    </div>
  );
};

export default OnboardingRole;