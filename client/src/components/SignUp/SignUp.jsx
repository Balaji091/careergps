import React, { useState, useRef, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getPasswordStrength, isValidEmail, passwordStrengthColorMap } from '../../utils';
import SignUpBrandPanel from './SignUpBrandPanel';
import SignUpFormPanel from './SignUpFormPanel';

/* ─── Password Strength Engine ─── */
const SignUp = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useContext(AuthContext);
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
  const [touched, setTouched] = useState({});
  const mainRef = useRef(null);

  /* ─── Derived Validation State ─── */
  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const colors = useMemo(
    () => passwordStrengthColorMap[strength.color] || passwordStrengthColorMap.error,
    [strength.color]
  );
  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;
  const emailValid = formData.email.length > 0 && isValidEmail(formData.email);
  const emailInvalid = touched.email && formData.email.length > 0 && !isValidEmail(formData.email);
  const nameInvalid = touched.name && formData.name.trim().length > 0 && formData.name.trim().length < 2;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.id]: true }));
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
    if (loading) return;

    // Client-side validation
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (strength.score <= 2) {
      setError('Please choose a stronger password.');
      return;
    }
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

  const handleGoogleSuccess = async (credential) => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const userData = await googleLogin(credential);
      if (userData.profile?.targetRole) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/role');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col md:flex-row overflow-x-hidden font-sans">
      <SignUpBrandPanel />
      <SignUpFormPanel
        colors={colors}
        emailInvalid={emailInvalid}
        emailValid={emailValid}
        error={error}
        formData={formData}
        handleBlur={handleBlur}
        handleChange={handleChange}
        handleMouseMove={handleMouseMove}
        handleGoogleError={setError}
        handleGoogleSuccess={handleGoogleSuccess}
        handleSubmit={handleSubmit}
        loading={loading}
        mainRef={mainRef}
        nameInvalid={nameInvalid}
        passwordsMatch={passwordsMatch}
        passwordsMismatch={passwordsMismatch}
        setShowConfirmPassword={setShowConfirmPassword}
        setShowPassword={setShowPassword}
        showConfirmPassword={showConfirmPassword}
        showPassword={showPassword}
        strength={strength}
      />
    </div>
  );
};

export default SignUp;
