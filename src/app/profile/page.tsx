'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, setUser } = useAuthStore();
  const [status, setStatus] = useState<string>('Loading...');

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login?redirect=/profile');
      return;
    }

    // If user has a valid ID, redirect to their profile
    if (user.id && user.id.length === 24) {
      router.replace(`/profile/${user.id}`);
      return;
    }

    // If user exists but no valid ID, fetch fresh profile from API
    setStatus('Refreshing profile...');
    authApi.getMe().then((freshUser) => {
      if (freshUser?.id) {
        // Update the store with fresh user data
        setUser(freshUser);
        router.replace(`/profile/${freshUser.id}`);
      } else {
        setStatus('Could not load profile. Please log in again.');
        // Clear invalid auth state
        setTimeout(() => router.replace('/login?redirect=/profile'), 2000);
      }
    }).catch(() => {
      setStatus('Could not load profile. Please log in again.');
      setTimeout(() => router.replace('/login?redirect=/profile'), 2000);
    });
  }, [isAuthenticated, isLoading, user, router, setUser]);

  return (
    <div className="min-h-screen aurora-bg flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4" />
      <div className="text-white/50 text-sm">{status}</div>
    </div>
  );
}
