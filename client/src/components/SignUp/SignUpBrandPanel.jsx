import React from 'react';

const SignUpBrandPanel = () => (
  <>
  {/* Left Side: Visual/Branding (Desktop Only) */}
  <section className="hidden md:flex md:w-1/2 relative overflow-hidden bg-primary items-center justify-center p-margin-desktop">
    <div className="relative z-10 max-w-lg text-on-primary">
      <div className="mb-stack-lg animate-float">
        <span className="material-symbols-outlined text-8xl opacity-90" style={{ fontVariationSettings: "'FILL' 1" }}>
          explore
        </span>
      </div>
      <h1 className="font-headline-xl text-headline-xl mb-stack-md leading-tight">
        Chart Your Engineering Future.
      </h1>
      <p className="font-body-lg text-body-lg opacity-80 mb-stack-lg">
        Join 10,000+ technical leaders using data-driven insights to accelerate their career trajectory from IC to Executive.
      </p>
      <div className="flex flex-col gap-gutter">
        <div className="flex items-center gap-stack-md">
          <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">timeline</span>
          </div>
          <p className="font-label-md text-label-md">Skill Gap Analysis & Roadmap</p>
        </div>
        <div className="flex items-center gap-stack-md">
          <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">insights</span>
          </div>
          <p className="font-label-md text-label-md">Real-time Market Salary Benchmarks</p>
        </div>
        <div className="flex items-center gap-stack-md">
          <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary">groups</span>
          </div>
          <p className="font-label-md text-label-md">Exclusive Tech Leadership Circles</p>
        </div>
      </div>
    </div>
  </section>
  </>
);

export default SignUpBrandPanel;
