'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';

/**
 * Initializes social data (followed users, etc.) when user is authenticated
 * This should be wrapped around the app layout
 */
export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { loadFollowedUsers, reset, isLoaded } = useSocialStore();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    if (isAuthenticated && !isLoaded) {
      // Load social data when authenticated
      loadFollowedUsers();
    } else if (!isAuthenticated && isLoaded) {
      // Clear social data when logged out
      reset();
    }
  }, [isAuthenticated, authLoading, isLoaded, loadFollowedUsers, reset]);

  return <>{children}</>;
}
