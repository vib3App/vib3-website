'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { SettingsCard, SettingsLink } from './SettingsComponents';

export function AccountSection() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const addToast = useToastStore((s) => s.addToast);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiClient.post('/api/user/delete-account');
      addToast('Your account has been scheduled for deletion. You have 30 days to cancel by logging back in.', 'success');
      setShowDeleteDialog(false);
      try { await authApi.logout(); } catch { /* ignore */ }
      logout();
      router.push('/');
    } catch {
      addToast('Failed to delete account. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsLink
          label="Edit Profile"
          icon={<svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          iconBg="bg-purple-500/20"
        />
        <SettingsLink
          label="Email & Phone"
          icon={<svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
          iconBg="bg-teal-500/20"
        />
        <SettingsLink
          label="Password"
          icon={<svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
          iconBg="bg-yellow-500/20"
        />
      </SettingsCard>
      <SettingsCard>
        <SettingsLink
          label="VIB3 Pro"
          icon={<svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
          iconBg="bg-purple-500/20"
          rightContent={<span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-teal-400 text-white text-xs font-medium rounded-full">Upgrade</span>}
        />
      </SettingsCard>

      {/* Delete Account */}
      <SettingsCard>
        <SettingsLink
          label="Delete Account"
          icon={<svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
          iconBg="bg-red-500/20"
          showArrow={false}
          onClick={() => setShowDeleteDialog(true)}
        />
      </SettingsCard>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold">Delete Account</h3>
            </div>

            <div className="space-y-3 text-white/70 text-sm">
              <p>
                Are you sure you want to delete your account? This action will schedule your account for permanent deletion.
              </p>
              <p>
                You will have <span className="text-white font-medium">30 days</span> to cancel by logging back in. After 30 days, all your data will be permanently deleted, including:
              </p>
              <ul className="list-disc list-inside space-y-1 text-white/60">
                <li>Your profile and account information</li>
                <li>All videos you have uploaded</li>
                <li>Comments, likes, and messages</li>
                <li>Followers and following lists</li>
              </ul>
              <p className="text-red-400 font-medium">
                This cannot be undone after the 30-day grace period.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteDialog(false)}
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
      )}
    </div>
  );
}
