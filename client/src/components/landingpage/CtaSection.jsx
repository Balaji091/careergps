import React from 'react';
import { Link } from 'react-router-dom';

const CtaSection = () => {
  return (
    <section className="py-20 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-4xl mx-auto rounded-3xl bg-primary-container p-10 md:p-16 text-center relative overflow-hidden">
        {/* Atmospheric blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary-container/30 blur-[80px] -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] translate-x-1/2 translate-y-1/2 rounded-full"></div>
        <div className="relative z-10">
          <h2 className="font-headline-lg text-headline-lg text-on-primary-container mb-6">
            Stop Browsing Careers. Start Engineering Yours.
          </h2>
          <p className="font-body-lg text-body-lg text-on-primary-container/80 mb-10 max-w-2xl mx-auto">
           Personalized AI learning, interactive concept labs, and a roadmap tailored to your target role.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/signup" 
              className="h-[52px] px-10 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
            >
              Start Your Learning Journey
            </Link>
            {/* <button className="h-[52px] px-10 border border-on-primary-container/30 text-on-primary-container font-bold rounded-xl hover:bg-white/10 transition-all">
              Request Team Demo
            </button> */}
          </div>
          <p className="mt-8 text-sm text-on-primary-container/60 font-label-md">
            Free to get started • Personalized roadmap in minutes • No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
