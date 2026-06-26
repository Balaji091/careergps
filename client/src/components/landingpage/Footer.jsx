import React from 'react';
import Logo from '../../components/Logo';

const Footer = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 py-12 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="grayscale opacity-70">
            <Logo textSize="text-sm" />
          </div>
          <p className="text-xs text-on-surface-variant max-w-xs text-center md:text-left">
            The world's first AI-powered navigation system for technical talent. Built for engineers, by engineers.
          </p>
        </div>
        <div className="flex gap-8">
          <a className="text-xs font-label-md text-on-surface-variant hover:text-primary" href="#">Privacy</a>
          <a className="text-xs font-label-md text-on-surface-variant hover:text-primary" href="#">Terms</a>
          <a className="text-xs font-label-md text-on-surface-variant hover:text-primary" href="#">LinkedIn</a>
          <a className="text-xs font-label-md text-on-surface-variant hover:text-primary" href="#">X / Twitter</a>
        </div>
        <p className="text-[11px] text-outline font-label-sm">© 2024 Career GPS Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
