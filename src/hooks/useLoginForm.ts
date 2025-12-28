'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

function getMaxBirthdate(): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 13);
  return date.toISOString().split('T')[0];
}

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

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}

function validateUsername(username: string): string | null {
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be 20 characters or less';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return null;
}

export type AuthMode = 'login' | 'register' | 'forgot';

export function useLoginForm() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  const maxBirthdate = useMemo(() => getMaxBirthdate(), []);

  useEffect(() => {
    if (googleLoaded && window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      const googleBtn = document.getElementById('google-signin-btn');
      if (googleBtn) {
        window.google.accounts.id.renderButton(googleBtn, {
          theme: 'filled_black',
          size: 'large',
          width: 200,
        });
      }
    }
  }, [googleLoaded]);

  const handleGoogleCallback = useCallback(async (response: { credential: string }) => {
    try {
      setIsSubmitting(true);
      setError('');
      const user = await authApi.googleLogin(response.credential);
      setUser(user);
      router.push('/feed');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Google sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [router, setUser]);

  const handleAppleSignIn = useCallback(async () => {
    try {
      if (!window.AppleID) {
        setError('Apple Sign In not available');
        return;
      }

      setIsSubmitting(true);
      setError('');

      window.AppleID.auth.init({
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'net.vib3app.web',
        scope: 'name email',
        redirectURI: `${window.location.origin}/api/auth/apple/callback`,
        usePopup: true,
      });

      const response = await window.AppleID.auth.signIn();
      const user = await authApi.appleLogin({
        idToken: response.authorization.id_token,
        authorizationCode: response.authorization.code,
        fullName: response.user?.name ? {
          givenName: response.user.name.firstName,
          familyName: response.user.name.lastName,
        } : undefined,
      });

      setUser(user);
      router.push('/feed');
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (error.message !== 'popup_closed_by_user') {
        setError(error.message || 'Apple sign in failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [router, setUser]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'forgot') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (mode === 'register') {
      const pwError = validatePassword(password);
      if (pwError) errors.password = pwError;
    }

    if (mode === 'register') {
      const usernameError = validateUsername(username);
      if (usernameError) errors.username = usernameError;

      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (!birthdate) {
        errors.birthdate = 'Please enter your birthdate';
      } else if (!isValidAge(birthdate)) {
        errors.birthdate = 'You must be at least 13 years old to register';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [mode, email, password, confirmPassword, username, birthdate]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        await authApi.requestPasswordReset(email);
        setSuccess('Password reset email sent! Check your inbox.');
        return;
      }

      let user;
      if (mode === 'login') {
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
  }, [mode, email, password, username, birthdate, validateForm, setUser, router]);

  const clearFieldError = useCallback((field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [fieldErrors]);

  const changeMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  }, []);

  const promptGoogleSignIn = useCallback(() => {
    window.google?.accounts.id.prompt();
  }, []);

  return {
    mode,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    username,
    setUsername,
    birthdate,
    setBirthdate,
    error,
    success,
    fieldErrors,
    isSubmitting,
    showPassword,
    setShowPassword,
    googleLoaded,
    setGoogleLoaded,
    maxBirthdate,
    handleSubmit,
    handleAppleSignIn,
    clearFieldError,
    changeMode,
    promptGoogleSignIn,
  };
}
