'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';

/**
 * Initializes social data (followed users, etc.) when user is authenticated
 * This should be wrapped around the app layout
 */
export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isAuthVerified } = useAuthStore();
  const hasLoadedRef = useRef(false);
  const hasResetRef = useRef(false);

  useEffect(() => {
    // Wait for AuthProvider to verify the token before doing anything
    // This prevents API calls with stale/expired tokens
    if (!isAuthVerified) {
      return;
    }

    // Get store actions directly to avoid re-render on store changes
    const { loadFollowedUsers, reset } = useSocialStore.getState();

    if (isAuthenticated && user?.id) {
      // Load social data only once per session
      if (!hasLoadedRef.current) {
        console.log('[SocialProvider] Auth verified, loading social data...');
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
  }, [isAuthenticated, user?.id, isAuthVerified]);

  return <>{children}</>;
}
