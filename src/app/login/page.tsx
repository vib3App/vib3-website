'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

// Calculate minimum birthdate (13 years ago)
function getMaxBirthdate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 13);
  return date.toISOString().split('T')[0];
}

// Validate age is 13+
function isValidAge(birthdate: string): boolean {
  const birth = new Date(birthdate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13;
  }
  return age >= 13;
}

// Validate password strength
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}

// Validate username
function validateUsername(username: string): string | null {
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be 20 characters or less';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const maxBirthdate = useMemo(() => getMaxBirthdate(), []);

  // Validate form before submission
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (!isLogin) {
      const pwError = validatePassword(password);
      if (pwError) errors.password = pwError;
    }

    // Registration-specific validations
    if (!isLogin) {
      // Username
      const usernameError = validateUsername(username);
      if (usernameError) errors.username = usernameError;

      // Confirm password
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Birthdate
      if (!birthdate) {
        errors.birthdate = 'Please enter your birthdate';
      } else if (!isValidAge(birthdate)) {
        errors.birthdate = 'You must be at least 13 years old to register';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let user;
      if (isLogin) {
        user = await authApi.login({ email, password });
      } else {
        user = await authApi.register({ email, password, username, birthdate });
      }

      setUser(user);
      router.push('/feed');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear field error when user starts typing
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#14B8A6] flex items-center justify-center font-bold text-2xl text-white">
            V
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r from-[#6366F1] to-[#14B8A6] bg-clip-text text-transparent">
            VIB3
          </span>
        </Link>

        {/* Card */}
        <div className="bg-[#1A1F2E] rounded-2xl p-8 border border-white/5">
          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-white/50 text-center mb-6">
            {isLogin ? 'Sign in to continue' : 'Join the VIB3 community'}
          </p>

          {/* Toggle */}
          <div className="flex bg-[#0A0E1A] rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? 'bg-[#6366F1] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? 'bg-[#6366F1] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-white/70 text-sm mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); clearFieldError('username'); }}
                  className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                    fieldErrors.username ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
                  }`}
                  placeholder="Choose a username"
                />
                {fieldErrors.username && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.username}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-white/70 text-sm mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                  fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
                }`}
                placeholder="Enter your email"
              />
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-white/70 text-sm mb-2">Birthdate</label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => { setBirthdate(e.target.value); clearFieldError('birthdate'); }}
                  max={maxBirthdate}
                  className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                    fieldErrors.birthdate ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
                  }`}
                  style={{ colorScheme: 'dark' }}
                />
                {fieldErrors.birthdate && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.birthdate}</p>
                )}
                <p className="text-white/30 text-xs mt-1">You must be at least 13 years old</p>
              </div>
            )}

            <div>
              <label className="block text-white/70 text-sm mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
                  className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none transition-colors ${
                    fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
                  }`}
                  placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>
              )}
              {!isLogin && !fieldErrors.password && (
                <p className="text-white/30 text-xs mt-1">8+ characters, uppercase, lowercase, number</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-white/70 text-sm mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                  className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
                    fieldErrors.confirmPassword ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
                  }`}
                  placeholder="Confirm your password"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* OAuth buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[#0A0E1A] border border-white/10 rounded-lg py-3 text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 bg-[#0A0E1A] border border-white/10 rounded-lg py-3 text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          {/* Terms */}
          <p className="text-white/30 text-xs text-center mt-6">
            By continuing, you agree to our{' '}
            <a href="https://vib3app.net/terms.html" className="text-[#6366F1] hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="https://vib3app.net/privacy.html" className="text-[#6366F1] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
