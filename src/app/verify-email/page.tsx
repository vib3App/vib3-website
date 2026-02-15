'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { isAuthenticated } = useAuthStore();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus('success');
        // Redirect to feed after 3 seconds if logged in, otherwise to login
        setTimeout(() => {
          router.push(isAuthenticated ? '/feed' : '/login');
        }, 3000);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setStatus('error');
        setError(error.response?.data?.message || 'Failed to verify email. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token, router, isAuthenticated]);

  const handleResend = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsResending(true);
    try {
      await authApi.resendVerificationEmail();
      setResendSuccess(true);
    } catch (err) {
      console.error('Failed to resend verification email:', err);
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
          <p className="text-white/60">Please wait while we verify your email...</p>
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
          <h1 className="text-2xl font-bold text-white mb-2">Email Verified!</h1>
          <p className="text-white/60 mb-6">Your email has been successfully verified. Redirecting...</p>
          <Link
            href={isAuthenticated ? '/feed' : '/login'}
            className="inline-flex items-center justify-center px-6 py-3 bg-purple-500 text-white font-medium rounded-xl hover:bg-purple-600 transition-colors"
          >
            {isAuthenticated ? 'Go to Feed' : 'Go to Login'}
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'no-token') {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-white/60 mb-6">
            Check your inbox for a verification link. If you haven&apos;t received it, you can request a new one.
          </p>

          {resendSuccess ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm mb-4">
              Verification email sent! Check your inbox.
            </div>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full bg-purple-500 text-white font-medium py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 mb-4"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          )}

          <Link href="/login" className="text-white/50 hover:text-white text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
        <p className="text-white/60 mb-6">{error}</p>

        {resendSuccess ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm mb-4">
            New verification email sent! Check your inbox.
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full bg-purple-500 text-white font-medium py-3 rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 mb-4"
          >
            {isResending ? 'Sending...' : 'Request New Verification Email'}
          </button>
        )}

        <Link href="/login" className="text-white/50 hover:text-white text-sm">
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
