import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { LogIn, Key, Mail, AlertTriangle } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      if (!user.profile?.targetRole) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center">
            <Logo textSize="text-base" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">Sign in to your learning OS</h2>
          <p className="text-xs text-[#6B7280]">Unlock your personalized engineering path</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-[#EF4444] text-xs p-3 rounded-lg flex items-start space-x-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280]">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B7280] pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#2563EB] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B7280] pointer-events-none">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs shadow-sm flex items-center justify-center space-x-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="border-t border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
          New to CGPS?{' '}
          <Link to="/register" className="font-bold text-[#2563EB] hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
