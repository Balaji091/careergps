import React from 'react';

const ProcessTimeline = () => {
  return (
    <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg mb-4 text-on-surface">The Engineered Growth Framework</h2>
          <p className="font-body-md text-on-surface-variant max-w-xl mx-auto">
            Our structured process takes the guesswork out of career advancement.
          </p>
        </div>
        <div className="relative">
          {/* Connector Line */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] timeline-line -translate-y-1/2 hidden md:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-stack-lg relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-primary flex items-center justify-center mb-6 shadow-xl relative group cursor-pointer">
                <span className="material-symbols-outlined text-primary text-3xl transition-transform group-hover:rotate-12">
                  person_add
                </span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center">
                  01
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md mb-2 text-on-surface">Onboard</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Sync your GitHub and LinkedIn to map your baseline technical DNA.
              </p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-primary-fixed-dim flex items-center justify-center mb-6 shadow-lg relative group cursor-pointer">
                <span className="material-symbols-outlined text-primary text-3xl transition-transform group-hover:scale-110">
                  tune
                </span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-outline text-on-primary rounded-full text-[10px] font-bold flex items-center justify-center">
                  02
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md mb-2 text-on-surface">Customize</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Set your North Star goal (e.g., Staff Engineer at a Series B startup).
              </p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-outline-variant/30 flex items-center justify-center mb-6 shadow-md relative group cursor-pointer">
                <span className="material-symbols-outlined text-outline text-3xl transition-transform group-hover:animate-spin">
                  psychology
                </span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-outline-variant text-on-surface-variant rounded-full text-[10px] font-bold flex items-center justify-center">
                  03
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md mb-2 text-on-surface">Practice</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Execute high-signal tasks and interactive system design labs.
              </p>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-lowest border-4 border-outline-variant/30 flex items-center justify-center mb-6 shadow-md relative group cursor-pointer">
                <span className="material-symbols-outlined text-outline text-3xl transition-transform group-hover:scale-125">
                  military_tech
                </span>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-outline-variant text-on-surface-variant rounded-full text-[10px] font-bold flex items-center justify-center">
                  04
                </div>
              </div>
              <h4 className="font-headline-md text-headline-md mb-2 text-on-surface">Master</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Secure your promotion with a verifiable portfolio of career evidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
