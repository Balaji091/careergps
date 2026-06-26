import React, { useState, useRef, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setError('');
    setLoading(true);
    try {
      const userData = await login(formData.email, formData.password);
      setLoading(false);
      if (userData.profile?.targetRole) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/role');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    }
  };

  const successMessage = location.state?.message;

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
           Build the Engineering Career You Dream Of
          </h1>
          <p className="font-body-lg text-body-lg opacity-80 mb-stack-lg">
             Continue learning, practicing, and growing with your personalized roadmap.
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
              <p className="font-label-md text-label-md">Track Your Progress</p>
            </div>
            <div className="flex items-center gap-stack-md">
              <div className="w-10 h-10 rounded-full bg-on-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary">groups</span>
              </div>
              <p className="font-label-md text-label-md">Learning Intelligence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Login Form */}
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
              Welcome Back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              Sign in to continue your engineered growth journey.
            </p>
            {successMessage && (
              <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/25 text-xs font-semibold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/25 text-xs font-semibold flex items-center gap-2 mb-4 animate-shake">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form className="space-y-stack-md" onSubmit={handleSubmit}>
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
              <div className="flex justify-between items-center mb-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <a href="#" className="text-xs text-primary hover:underline font-semibold">
                  Forgot Password?
                </a>
              </div>
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md rounded-xl shadow-lg hover:shadow-primary/20 hover:opacity-90 transition-all duration-200 active:scale-[0.98] mt-8 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-stack-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Don't have an account?{' '}
              <Link
                className="text-primary font-label-md hover:underline decoration-2 underline-offset-4"
                to="/signup"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="mt-12 font-label-sm text-label-sm text-outline text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <a className="hover:text-on-surface-variant " href="#">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="hover:text-on-surface-variant " href="#">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
