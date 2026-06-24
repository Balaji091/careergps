import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AppContext } from '../context/AppContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';

const VerifyEmail = () => {
  const { verifyEmailToken } = useContext(AuthContext);
  const { showToast } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setLoading(false);
        setMessage('No verification token provided in url.');
        return;
      }

      try {
        const res = await verifyEmailToken(token);
        setSuccess(true);
        setMessage(res.message || 'Your email has been verified successfully!');
        showToast('Email verified successfully!', 'success');
      } catch (err) {
        setSuccess(false);
        setMessage(err.response?.data?.message || 'Verification failed. Token may be invalid or expired.');
        showToast('Verification failed.', 'error');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="bg-[#F8FAFC] min-h-screen flex items-center justify-center py-12 px-6 font-sans">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-6 sm:p-8 text-center space-y-6">
        <Link to="/" className="inline-flex items-center justify-center">
          <Logo textSize="text-base" />
        </Link>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin" />
            <h3 className="font-bold text-xs text-[#6B7280]">Verifying your email...</h3>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto text-[#22C55E]">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#111827] text-base">Verification Successful</h3>
            <p className="text-xs text-[#6B7280]">{message}</p>
            <Link
              to="/login"
              className="block w-full py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-xs shadow-sm"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-[#EF4444]">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-[#111827] text-base">Verification Failed</h3>
            <p className="text-xs text-[#6B7280]">{message}</p>
            <Link
              to="/register"
              className="block w-full py-2 bg-gray-50 border border-[#E5E7EB] hover:bg-[#F8FAFC] text-[#6B7280] font-semibold rounded-lg transition-colors text-xs"
            >
              Back to Registration
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
