import React from 'react';
import { Link } from 'react-router-dom';

const SignUpFormPanel = ({
  colors,
  emailInvalid,
  emailValid,
  error,
  formData,
  handleBlur,
  handleChange,
  handleMouseMove,
  handleSubmit,
  loading,
  mainRef,
  nameInvalid,
  passwordsMatch,
  passwordsMismatch,
  setShowConfirmPassword,
  setShowPassword,
  showConfirmPassword,
  showPassword,
  strength,
}) => (
  <>
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
        {/* Full Name */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="name">
            Full Name
          </label>
          <input
            className={`w-full h-12 bg-surface-container-low border rounded-xl px-4 font-body-md text-body-md focus:outline-none focus:ring-4 transition-all ${
              nameInvalid
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                : 'border-outline-variant focus:border-primary focus:ring-primary/10'
            }`}
            id="name"
            placeholder="John Doe"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {nameInvalid && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Name must be at least 2 characters
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <input
              className={`w-full h-12 bg-surface-container-low border rounded-xl px-4 pr-10 font-body-md text-body-md focus:outline-none focus:ring-4 transition-all ${
                emailInvalid
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  : emailValid
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                    : 'border-outline-variant focus:border-primary focus:ring-primary/10'
              }`}
              id="email"
              placeholder="john@company.com"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {emailValid && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500 text-[20px] animate-pop-in" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            )}
            {emailInvalid && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-red-500 text-[20px]">
                cancel
              </span>
            )}
          </div>
          {emailInvalid && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password */}
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

          {/* Dynamic Strength Bars */}
          {formData.password.length > 0 && (
            <>
              <div className="mt-2.5 flex gap-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.bars ? colors.bar : 'bg-outline-variant/40'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className={`font-label-sm text-label-sm font-semibold ${colors.text} transition-colors duration-300`}>
                  {strength.label}
                </p>
                <p className="font-label-sm text-label-sm text-outline">
                  {formData.password.length < 8 ? `${8 - formData.password.length} more chars needed` : ''}
                </p>
              </div>

              {/* Password Requirements Checklist */}
              {strength.checks && (
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {[
                    { key: 'length', label: '8+ characters' },
                    { key: 'uppercase', label: 'Uppercase (A-Z)' },
                    { key: 'lowercase', label: 'Lowercase (a-z)' },
                    { key: 'number', label: 'Number (0-9)' },
                    { key: 'special', label: 'Special (!@#$)' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`material-symbols-outlined text-[14px] transition-colors duration-200 ${
                          strength.checks[key] ? 'text-emerald-500' : 'text-outline-variant'
                        }`}
                        style={strength.checks[key] ? { fontVariationSettings: "'FILL' 1" } : {}}
                      >
                        {strength.checks[key] ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={`transition-colors duration-200 ${
                        strength.checks[key] ? 'text-on-surface' : 'text-outline'
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative">
            <input
              className={`w-full h-12 bg-surface-container-low border rounded-xl px-4 pr-10 font-body-md text-body-md focus:outline-none focus:ring-4 transition-all ${
                passwordsMismatch
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10'
                  : passwordsMatch
                    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/10'
                    : 'border-outline-variant focus:border-primary focus:ring-primary/10'
              }`}
              id="confirmPassword"
              placeholder="••••••••"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {/* Match / Mismatch Icon */}
            {passwordsMatch && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2 material-symbols-outlined text-emerald-500 text-[20px] animate-pop-in" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            )}
            {passwordsMismatch && (
              <span className="absolute right-10 top-1/2 -translate-y-1/2 material-symbols-outlined text-red-500 text-[20px]">
                cancel
              </span>
            )}
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
          {passwordsMismatch && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Passwords do not match
            </p>
          )}
          {passwordsMatch && (
            <p className="mt-1.5 text-xs text-emerald-500 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Passwords match
            </p>
          )}
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
        <a className="hover:text-on-surface-variant " href="#">
          Terms of Service
        </a>{' '}
        and{' '}
        <a className="hover:text-on-surface-variant " href="#" >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  </main>
  </>
);

export default SignUpFormPanel;
