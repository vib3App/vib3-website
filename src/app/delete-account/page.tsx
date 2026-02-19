'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

export default function DeleteAccountPage() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isAuthVerified, logout } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiClient.post('/api/user/delete-account');
      setIsDeleted(true);
      addToast('Your account has been scheduled for deletion.', 'success');
      try { await authApi.logout(); } catch { /* ignore */ }
      logout();
    } catch {
      addToast('Failed to delete account. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Not logged in — show login prompt
  if (isAuthVerified && !isAuthenticated && !isDeleted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <AuroraBackground intensity={20} />
        <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-4 relative z-10 text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">Delete Your Account</h1>
          <p className="text-white/70 text-sm">
            You need to be logged in to delete your account.
          </p>
          <Link
            href="/login?redirect=/delete-account"
            className="block w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-medium rounded-xl text-center hover:opacity-90 transition-opacity"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  // Success state after deletion
  if (isDeleted) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <AuroraBackground intensity={20} />
        <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-4 relative z-10 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">Account Deletion Scheduled</h1>
          <p className="text-white/70 text-sm">
            Your account has been scheduled for permanent deletion. You have <span className="text-white font-medium">30 days</span> to cancel by logging back in.
          </p>
          <p className="text-white/50 text-xs">
            After 30 days, all your data will be permanently removed.
          </p>
          <Link
            href="/"
            className="block w-full px-4 py-3 glass rounded-xl text-white font-medium hover:bg-white/10 transition-colors text-center"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Loading auth state
  if (!isAuthVerified) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <AuroraBackground intensity={20} />
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  // Main delete account flow
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <AuroraBackground intensity={20} />
      <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-white text-xl font-bold">Delete Your Account</h1>
        </div>

        <div className="space-y-3 text-white/70 text-sm">
          <p>
            Are you sure you want to delete your VIB3 account? This action will schedule your account for permanent deletion.
          </p>
          <p>
            You will have <span className="text-white font-medium">30 days</span> to cancel by logging back in. After 30 days, all your data will be permanently deleted, including:
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/60">
            <li>Your profile and account information</li>
            <li>All videos you have uploaded</li>
            <li>Comments, likes, and messages</li>
            <li>Followers and following lists</li>
            <li>Wallet balance and transaction history</li>
          </ul>
          <p className="text-red-400 font-medium">
            This cannot be undone after the 30-day grace period.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => router.push('/settings')}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 glass rounded-xl text-white font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-500/20 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
