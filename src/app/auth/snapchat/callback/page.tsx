'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

function SnapchatCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setStatus('error');
      setError(errorParam === 'access_denied' ? 'Snapchat login was cancelled.' : `Snapchat error: ${errorParam}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setError('No authorization code received from Snapchat.');
      return;
    }

    // Validate CSRF state
    const savedState = typeof window !== 'undefined'
      ? sessionStorage.getItem('snapchat_oauth_state')
      : null;

    if (state && savedState && state !== savedState) {
      setStatus('error');
      setError('Security validation failed. Please try again.');
      return;
    }

    // Clear the saved state
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('snapchat_oauth_state');
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/snapchat/callback`;
        const user = await authApi.snapchatLogin(code, redirectUri);
        setUser(user);
        setStatus('success');
        setTimeout(() => router.push('/feed'), 1500);
      } catch (err: unknown) {
        const apiError = err as { message?: string };
        setStatus('error');
        setError(apiError.message || 'Failed to sign in with Snapchat.');
      }
    };

    exchangeCode();
  }, [searchParams, router, setUser]);

  if (status === 'processing') {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Signing in with Snapchat</h1>
          <p className="text-white/60">Please wait while we complete your login...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to VIB3!</h1>
          <p className="text-white/60">Redirecting to your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Login Failed</h1>
        <p className="text-white/60 mb-6">{error}</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );
}

export default function SnapchatCallbackPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SnapchatCallbackContent />
    </Suspense>
  );
}
