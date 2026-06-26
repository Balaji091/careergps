import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';

const Header = () => {
  return (
    <header className="sticky top-0 w-full z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
      <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <Logo textSize="text-lg" />
      </Link>
      <nav className="hidden md:flex items-center gap-stack-lg">
        <Link className="font-label-md text-label-md text-primary font-bold" to="/">Home</Link>
        <a className="font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high/50 transition-colors px-3 py-1 rounded-lg" href="#product-mockup">Product</a>
      </nav>
      <div className="flex items-center gap-4">
        <Link 
          to="/login" 
          className="hidden sm:block font-label-md text-label-md text-primary font-semibold hover:text-primary/80 transition-colors"
        >
          Log In
        </Link>
        <Link 
          to="/signup" 
          className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-all active:scale-95 shadow-md inline-flex items-center justify-center"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
};

export default Header;
