import React from 'react';
import { Header, Hero, DashboardMockup, ProcessTimeline, CtaSection, Footer } from './index';

const LandingPage = () => {
  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-primary/20 min-h-screen flex flex-col">
      <Header />
      <main className="relative overflow-hidden flex-1">
        <Hero />
        <DashboardMockup />
        <ProcessTimeline />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
