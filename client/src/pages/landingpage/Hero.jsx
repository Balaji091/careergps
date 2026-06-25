import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-20 pb-32 px-margin-mobile md:px-margin-desktop hero-gradient">
      <div className="max-w-container-max mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full mb-6 animate-fade-in">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider">Next-Gen Career Intelligence</span>
        </div>
        <h1 className="font-headline-xl text-headline-xl mb-6 max-w-4xl mx-auto leading-tight">
          Engineer Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Technical Leadership</span>
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
          Precision-engineered career guidance for high-growth engineers. Navigate skill gaps, master new tech stacks, and accelerate your climb to Staff or Principal Engineer.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/signup" 
            className="h-[44px] px-8 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-lg font-label-md text-label-md font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 inline-flex items-center justify-center"
          >
            Start Your Journey
          </Link>
          <a 
            href="#product-mockup" 
            className="h-[44px] px-8 bg-surface-container-low border border-outline-variant/30 text-on-surface-variant rounded-lg font-label-md text-label-md font-semibold hover:bg-surface-container-high transition-all inline-flex items-center justify-center"
          >
            View Roadmap
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
