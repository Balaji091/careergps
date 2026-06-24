import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { UserPlus, User, Mail, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import Logo from '../components/Logo';

const Register = () => {
  const { register } = useContext(AuthContext);
  const { showToast } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(name, email, password);
      showToast('Registration successful! You can now log in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center">
            <Logo textSize="text-base" />
          </Link>
          <h2 className="text-xl font-bold tracking-tight text-[#111827]">Create your learning account</h2>
          <p className="text-xs text-[#6B7280]">Get custom roadmaps tailored to your targets</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-[#EF4444] text-xs p-3 rounded-lg flex items-start space-x-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isRegistered ? (
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-lg text-center space-y-3.5">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-[#2563EB]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#111827] text-sm">Verify Your Email</h3>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              We have sent a verification email to <strong className="text-[#111827]">{email}</strong>.
            </p>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Please click the link in the email to activate your account. Once verified, you can sign in.
            </p>
            <Link
              to="/login"
              className="block w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280]">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B7280] pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827] transition-all"
                />
              </div>
            </div>

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
                  placeholder="john@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B7280]">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#6B7280] pointer-events-none">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs shadow-sm flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </form>
        )}

        {!isRegistered && (
          <div className="border-t border-[#E5E7EB] pt-4 text-center text-xs text-[#6B7280]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
