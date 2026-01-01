'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // 14 minutes (assuming 15min token expiry)
const TOKEN_REFRESH_MARGIN = 60 * 1000; // 1 minute before expiry

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, setUser, logout, setLoading, isAuthenticated } = useAuthStore();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const isInitializedRef = useRef(false);

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
      const token = localStorage.getItem('auth_token');

      // No token = not authenticated, nothing to do
      // Don't call setLoading - store already has isLoading: false
      if (!token) {
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
          // No refresh token, clear the expired token
          localStorage.removeItem('auth_token');
        }
        return;
      }

      // Token valid, verify with backend
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
          // API returned null, clear tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
      } catch {
        // Verification failed (401/network error) - clear tokens silently
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
    };

    initializeAuth();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schedule refresh when user changes
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      scheduleTokenRefresh(user.token);
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.token]);

  // Listen for storage events (for multi-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        if (!e.newValue) {
          // Token removed in another tab
          logout();
        } else if (e.newValue !== user?.token) {
          // Token changed in another tab - reload to get new state
          window.location.reload();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.token, logout]);

  return <>{children}</>;
}
