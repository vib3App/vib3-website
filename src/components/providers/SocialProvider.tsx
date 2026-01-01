'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';

/**
 * Initializes social data (followed users, etc.) when user is authenticated
 * This should be wrapped around the app layout
 */
export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const hasLoadedRef = useRef(false);
  const hasResetRef = useRef(false);

  useEffect(() => {
    // Get store actions directly to avoid re-render on store changes
    const { loadFollowedUsers, reset } = useSocialStore.getState();

    // Only proceed if we have an actual token (not just persisted isAuthenticated)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (isAuthenticated && user?.id && token) {
      // Load social data only once per session
      if (!hasLoadedRef.current) {
        console.log('[SocialProvider] Auth complete, loading social data...');
        hasLoadedRef.current = true;
        hasResetRef.current = false;
        loadFollowedUsers(true);
      }
    } else if (!isAuthenticated && !hasResetRef.current) {
      // Clear social data when logged out (only once)
      hasLoadedRef.current = false;
      hasResetRef.current = true;
      reset();
    }
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
}
