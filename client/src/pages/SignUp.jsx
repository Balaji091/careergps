import React, { useState, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const mainRef = useRef(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleMouseMove = (e) => {
    if (mainRef.current) {
      const rect = mainRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mainRef.current.style.setProperty('--mouse-x', `${x}px`);
      mainRef.current.style.setProperty('--mouse-y', `${y}px`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      setLoading(false);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row overflow-x-hidden font-sans">
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

      {/* Right Side: Sign Up Form */}
      <main
        ref={mainRef}
        onMouseMove={handleMouseMove}
        className="flex-1 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface-bright relative signup-glow-container"
      >
        <div className="w-full max-w-md relative z-10">
          {/* Header for Mobile */}
          <div className="md:hidden flex items-center gap-stack-sm mb-stack-lg">
            <Link to="/" className="flex items-center gap-stack-sm">
              <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                explore
              </span>
              <span className="font-headline-md text-headline-md font-bold text-primary">Career GPS</span>
            </Link>
          </div>

          <div className="mb-stack-lg">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">
              Create Account
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Start your engineered growth journey today.
            </p>
            {error && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/25 text-xs font-semibold flex items-center gap-2 animate-shake">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                id="name"
                placeholder="John Doe"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                id="email"
                placeholder="john@company.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <div className="mt-2 flex gap-1">
                <div className="h-1 flex-1 bg-primary rounded-full"></div>
                <div className="h-1 flex-1 bg-primary rounded-full"></div>
                <div className="h-1 flex-1 bg-outline-variant rounded-full"></div>
                <div className="h-1 flex-1 bg-outline-variant rounded-full"></div>
              </div>
              <p className="mt-1 font-label-sm text-label-sm text-outline">Strength: Medium</p>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  className="w-full h-12 bg-surface-container-low border border-outline-variant rounded-xl px-4 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  id="confirmPassword"
                  placeholder="••••••••"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md rounded-xl shadow-lg hover:shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] mt-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Career Profile'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-stack-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Already have an account?{' '}
              <Link
                className="text-primary font-label-md hover:underline decoration-2 underline-offset-4"
                to="/login"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-12 font-label-sm text-label-sm text-outline text-center leading-relaxed">
            By signing up, you agree to our{' '}
            <a className="hover:text-on-surface-variant underline" href="#">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="hover:text-on-surface-variant underline" href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
