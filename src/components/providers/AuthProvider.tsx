'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (assuming 15min token expiry)
const TOKEN_REFRESH_MARGIN = 60 * 1000; // 1 minute before expiry

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
  const isLoggingOutRef = useRef(false); // Prevent duplicate logout calls
  const isVerifyingRef = useRef(false); // Prevent duplicate getMe calls

  // Parse JWT to get expiration time
  const getTokenExpiry = useCallback((token: string): number | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
    } catch {
      return null;
    }
  }, []);

  // Refresh the access token
  const refreshToken = useCallback(async () => {
    if (isRefreshingRef.current) return;

    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (!storedRefreshToken) {
      logout();
      return;
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
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [user, setUser, logout]);

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = useCallback((token: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const expiry = getTokenExpiry(token);
    if (!expiry) {
      // If can't parse expiry, refresh at fixed interval
      refreshTimeoutRef.current = setTimeout(refreshToken, TOKEN_REFRESH_INTERVAL);
      return;
    }

    const now = Date.now();
    const timeUntilExpiry = expiry - now;
    const refreshTime = Math.max(timeUntilExpiry - TOKEN_REFRESH_MARGIN, 1000);

    refreshTimeoutRef.current = setTimeout(refreshToken, refreshTime);
  }, [getTokenExpiry, refreshToken]);

  // Initialize auth state on mount - only if there's a stored token
  useEffect(() => {
    // Prevent duplicate initialization
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initializeAuth = async () => {
      // Module-level check: if we've already attempted verification in this session,
      // don't repeat it (prevents loops across component remounts)
      if (hasAttemptedAuthVerification) {
        console.log('[AuthProvider] Skipping auth verification (already attempted this session)');
        setAuthVerified(true);
        return;
      }
      hasAttemptedAuthVerification = true;

      const token = localStorage.getItem('auth_token');

      // No token = not authenticated
      // If Zustand has stale isAuthenticated, clear it
      if (!token) {
        if (isAuthenticated) {
          logout(); // This sets isAuthVerified: true
        } else {
          setAuthVerified(true); // Mark as verified (no auth)
        }
        return;
      }

      // Check if token is expired
      const expiry = getTokenExpiry(token);
      if (expiry && expiry < Date.now()) {
        // Token expired, try to refresh
        const refreshTokenValue = localStorage.getItem('refresh_token');
        if (refreshTokenValue) {
          await refreshToken();
        } else {
          // No refresh token, clear everything and logout
          localStorage.removeItem('auth_token');
          logout();
        }
        return;
      }

      // Token valid, verify with backend
      // Use ref to prevent duplicate getMe calls
      if (isVerifyingRef.current) {
        console.log('[AuthProvider] Skipping duplicate getMe call');
        return;
      }
      isVerifyingRef.current = true;

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
          // API returned null - clear tokens and reset state
          // Use direct store setState to batch the update and avoid cascade
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isAuthVerified: true
          });
        }
      } catch {
        // Verification failed (401/network error) - clear tokens and reset state
        // Use direct store setState to batch the update and avoid cascade
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isAuthVerified: true
        });
      }
    };

    // Listen for logout event from API client (401 responses from other endpoints)
    const handleLogoutEvent = () => {
      if (!isLoggingOutRef.current) {
        isLoggingOutRef.current = true;
        console.log('[AuthProvider] Received logout event');
        // Use direct store setState to avoid cascade
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isAuthVerified: true
        });
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
        if (!e.newValue) {
          // Token removed in another tab
          logout();
        } else if (e.newValue !== userToken) {
          // Token changed in another tab - reload to get new state
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [userToken, logout]);

  return <>{children}</>;
}
