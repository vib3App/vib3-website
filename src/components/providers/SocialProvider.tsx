'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';

/**
 * Initializes social data (followed users, etc.) when user is authenticated
 * This should be wrapped around the app layout
 */
export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { loadFollowedUsers, reset } = useSocialStore();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (isAuthenticated) {
      // Force refresh on first load after auth
      if (!hasLoadedRef.current) {
        console.log('[SocialProvider] Auth complete, loading social data...');
        hasLoadedRef.current = true;
        loadFollowedUsers(true); // Force refresh
      }
    } else {
      // Clear social data when logged out
      hasLoadedRef.current = false;
      reset();
    }
  }, [isAuthenticated, authLoading, loadFollowedUsers, reset]);

  return <>{children}</>;
}
