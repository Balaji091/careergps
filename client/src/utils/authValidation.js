export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '', bars: 0 };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    longLength: password.length >= 12,
  };

  if (checks.length) score++;
  if (checks.uppercase) score++;
  if (checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;
  if (checks.longLength) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'error', bars: 1, checks };
  if (score <= 3) return { score, label: 'Fair', color: 'warning', bars: 2, checks };
  if (score <= 4) return { score, label: 'Strong', color: 'primary', bars: 3, checks };
  return { score, label: 'Very Strong', color: 'success', bars: 4, checks };
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const passwordStrengthColorMap = {
  error: { bar: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500/20', border: 'border-red-500' },
  warning: { bar: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500/20', border: 'border-amber-500' },
  primary: { bar: 'bg-primary', text: 'text-primary', ring: 'ring-primary/20', border: 'border-primary' },
  success: { bar: 'bg-emerald-500', text: 'text-emerald-500', ring: 'ring-emerald-500/20', border: 'border-emerald-500' },
};
