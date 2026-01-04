'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (assuming 15min token expiry)
const TOKEN_REFRESH_MARGIN = 60 * 1000; // 1 minute before expiry
const MAX_REFRESH_RETRIES = 3;
const REFRESH_RETRY_DELAY = 2000; // 2 seconds between retries

// Module-level flag to prevent auth verification loops across component remounts
let hasAttemptedAuthVerification = false;

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Use selectors to avoid re-render loops - only subscribe to what we need
  const user = useAuthStore((s) => s.user);
  const userToken = useAuthStore((s) => s.user?.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const setAuthVerified = useAuthStore((s) => s.setAuthVerified);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const isInitializedRef = useRef(false);
  const isLoggingOutRef = useRef(false);
  const isVerifyingRef = useRef(false);

  // Parse JWT to get expiration time
  const getTokenExpiry = useCallback((token: string): number | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }, []);

  // Refresh the access token with retry logic
  const refreshToken = useCallback(async (retryCount = 0): Promise<boolean> => {
    if (isRefreshingRef.current && retryCount === 0) return false;

    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
      // No refresh token - but don't logout, just mark as not refreshable
      // User might still have valid access token
      return false;
    }

    isRefreshingRef.current = true;

    try {
      const response = await authApi.refreshToken(storedRefreshToken);

      // Store new tokens
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('refresh_token', response.refreshToken);

      // Update user state with new token
      if (user) {
        setUser({
          ...user,
          token: response.token,
          refreshToken: response.refreshToken,
        });
      }

      // Schedule next refresh
      scheduleTokenRefresh(response.token);
      isRefreshingRef.current = false;
      return true;
    } catch (error: unknown) {
      isRefreshingRef.current = false;

      // Check if it's a definitive rejection (401/403) vs temporary error
      const isDefinitiveRejection = error &&
        typeof error === 'object' &&
        'status' in error &&
        (error.status === 401 || error.status === 403);

      if (isDefinitiveRejection) {
        // Refresh token is invalid - but still don't logout immediately
        // Just clear the refresh token, keep the session until access token expires
        localStorage.removeItem('refresh_token');
        return false;
      }

      // Network or temporary error - retry
      if (retryCount < MAX_REFRESH_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, REFRESH_RETRY_DELAY));
        return refreshToken(retryCount + 1);
      }

      // Max retries reached - don't logout, just fail silently
      // User can still use the app until their access token expires
      return false;
    }
  }, [user, setUser]);

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = useCallback((token: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiry = getTokenExpiry(token);
    if (!expiry) {
      // If can't parse expiry, refresh at fixed interval
      refreshTimeoutRef.current = setTimeout(() => refreshToken(), TOKEN_REFRESH_INTERVAL);
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    const refreshTime = Math.max(timeUntilExpiry - TOKEN_REFRESH_MARGIN, 1000);

    refreshTimeoutRef.current = setTimeout(() => refreshToken(), refreshTime);
  }, [getTokenExpiry, refreshToken]);

  // Initialize auth state on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initializeAuth = async () => {
      // Module-level check to prevent loops
      if (hasAttemptedAuthVerification) {
        setAuthVerified(true);
        return;
      }
      hasAttemptedAuthVerification = true;

      const token = localStorage.getItem('auth_token');

      // No token = not authenticated, but check if we have persisted user state
      if (!token) {
        // Check if Zustand has persisted user - if so, try to refresh
        if (isAuthenticated) {
          const refreshed = await refreshToken();
          if (!refreshed) {
            // No valid session, clear state
            logout();
          }
        } else {
          setAuthVerified(true);
        }
        return;
      }

      // Check if token is expired
      const expiry = getTokenExpiry(token);
      const isExpired = expiry && expiry < Date.now();

      if (isExpired) {
        // Token expired, try to refresh
        const refreshed = await refreshToken();
        if (refreshed) {
          // Successfully refreshed, now verify with backend
          await verifyWithBackend();
        } else {
          // Couldn't refresh, but don't logout yet
          // Just mark as verified with current state
          setAuthVerified(true);
        }
        return;
      }

      // Token not expired, verify with backend
      await verifyWithBackend();
    };

    const verifyWithBackend = async () => {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setAuthVerified(true);
        return;
      }

      try {
        const userData = await authApi.getMe();
        if (userData) {
          setUser({
            ...userData,
            token,
            refreshToken: localStorage.getItem('refresh_token') || '',
          });
          scheduleTokenRefresh(token);
        } else {
          // API returned null - try refresh before giving up
          const refreshed = await refreshToken();
          if (!refreshed) {
            // Keep the persisted state if we have it, just mark as verified
            setAuthVerified(true);
          }
        }
      } catch {
        // Verification failed - try refresh before giving up
        const refreshed = await refreshToken();
        if (!refreshed) {
          // Network issue or invalid token
          // Don't clear everything - if we have persisted state, keep it
          // User can still try to use the app
          setAuthVerified(true);
        }
      }
    };

    // Listen for explicit logout events (user clicked logout, not automatic)
    const handleLogoutEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ reason?: string }>;
      // Only logout if it's an explicit request, not automatic token expiry
      if (customEvent.detail?.reason === 'user_requested') {
        if (!isLoggingOutRef.current) {
          isLoggingOutRef.current = true;
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isAuthVerified: true
          });
        }
      }
    };
    window.addEventListener('auth:logout', handleLogoutEvent);

    initializeAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schedule refresh when user changes
  useEffect(() => {
    if (isAuthenticated && userToken) {
      scheduleTokenRefresh(userToken);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, userToken]);

  // Listen for storage events (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (!e.newValue && e.oldValue) {
          // Token removed in another tab - user logged out explicitly
          logout();
        } else if (e.newValue && e.newValue !== userToken) {
          // Token changed in another tab - sync the new token
          // Don't reload, just update state
          const newRefreshToken = localStorage.getItem('refresh_token');
          if (user) {
            setUser({
              ...user,
              token: e.newValue,
              refreshToken: newRefreshToken || '',
            });
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userToken, user, setUser, logout]);

  return <>{children}</>;
}
