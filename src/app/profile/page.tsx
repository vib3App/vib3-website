'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

export default function ProfilePage() {
  const router = useRouter();
  // Only subscribe to specific primitives to avoid re-render loops
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthVerified = useAuthStore((s) => s.isAuthVerified);
  const userId = useAuthStore((s) => s.user?.id);
  const setUser = useAuthStore((s) => s.setUser);

  const [status, setStatus] = useState<string>('Loading...');
  const hasRedirectedRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    // Wait for auth to be verified before making decisions
    if (!isAuthVerified) return;

    // Prevent duplicate redirects
    if (hasRedirectedRef.current) return;

    if (!isAuthenticated) {
      hasRedirectedRef.current = true;
      router.replace('/login?redirect=/profile');
      return;
    }

    // If user has a valid ID, redirect to their profile
    if (userId && userId.length === 24) {
      hasRedirectedRef.current = true;
      router.replace(`/profile/${userId}`);
      return;
    }

    // Prevent duplicate API calls
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // If user exists but no valid ID, fetch fresh profile from API
    authApi.getMe().then((freshUser) => {
      if (hasRedirectedRef.current) return;
      if (freshUser?.id) {
        // Update the store with fresh user data
        setUser(freshUser);
        hasRedirectedRef.current = true;
        router.replace(`/profile/${freshUser.id}`);
      } else {
        setStatus('Could not load profile. Please log in again.');
        // Clear invalid auth state
        setTimeout(() => {
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.replace('/login?redirect=/profile');
          }
        }, 2000);
      }
    }).catch(() => {
      if (hasRedirectedRef.current) return;
      setStatus('Could not load profile. Please log in again.');
      setTimeout(() => {
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.replace('/login?redirect=/profile');
        }
      }, 2000);
    });
  }, [isAuthenticated, isAuthVerified, userId, router, setUser]);

  return (
    <div className="min-h-screen aurora-bg flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4" />
      <div className="text-white/50 text-sm">{status}</div>
    </div>
  );
}
