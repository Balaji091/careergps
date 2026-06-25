import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';

const OnboardingRole = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('DevOps Engineer'); // Default as selected in user HTML

  const roles = [
    { name: 'Frontend Lead', icon: 'developer_mode', color: 'secondary' },
    { name: 'DevOps Engineer', icon: 'terminal', color: 'primary' },
    { name: 'Fullstack Architect', icon: 'architecture', color: 'secondary' },
    { name: 'Security Engineer', icon: 'security', color: 'secondary' },
    { name: 'Data Scientist', icon: 'monitoring', color: 'secondary' },
    { name: 'Engineering Manager', icon: 'groups', color: 'secondary' },
  ];

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleSelect = (roleName) => {
    setSelectedRole(roleName);
  };

  const handleContinue = () => {
    localStorage.setItem('onboarding_targetRole', selectedRole);
    navigate('/onboarding/timeline');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_targetRole', 'DevOps Engineer');
    navigate('/onboarding/timeline');
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col items-center select-none">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-between items-center px-margin-mobile h-14 w-full border-b border-outline-variant/10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Logo textSize="text-base" />
        </Link>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-8 rounded-full bg-primary"></div>
          <div className="h-1.5 w-8 rounded-full bg-surface-container-highest"></div>
          <div className="h-1.5 w-8 rounded-full bg-surface-container-highest"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[480px] px-margin-mobile pt-24 pb-32 flex flex-col gap-stack-lg overflow-y-auto custom-scrollbar">
        {/* Header */}
        <section className="fade-in">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-2">
            What's your target role?
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            We'll tailor your syllabus based on industry-standard engineering paths.
          </p>
        </section>

        {/* Search Input */}
        <div className="relative fade-in">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all outline-none font-body-md text-on-surface placeholder:text-on-surface-variant/60"
            placeholder="Search engineering roles..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Grid */}
        <section className="grid grid-cols-2 gap-4 fade-in">
          {filteredRoles.map((role) => {
            const isSelected = selectedRole === role.name;
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
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
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
        </section>

        {/* Info Prompt */}
        <div className="p-4 bg-secondary-fixed text-on-secondary-fixed-variant rounded-xl flex gap-3 fade-in">
          <span className="material-symbols-outlined shrink-0 text-secondary">info</span>
          <p className="font-body-sm text-body-sm">
            Choosing a path sets your core competency radar. You can adjust this later in settings.
          </p>
        </div>
      </main>

      {/* Fixed Bottom Footer */}
      <footer className="fixed bottom-0 w-full max-w-[480px] bg-surface/80 backdrop-blur-md px-margin-mobile py-6 flex flex-col gap-4 z-50 border-t border-outline-variant/10">
        <button
          onClick={handleContinue}
          className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md rounded-full shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          Continue
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        <button
          onClick={handleSkip}
          className="w-full font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Skip for now
        </button>
      </footer>
    </div>
  );
};

export default OnboardingRole;
