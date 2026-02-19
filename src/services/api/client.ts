/**
 * Axios API client with interceptors
 * Handles auth, error formatting, token refresh, and request/response processing
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/config/env';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

// Track if we're currently refreshing to avoid multiple simultaneous refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function refreshAuthToken(): Promise<string | null> {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('refresh_token')
    : null;

  if (!refreshToken) {
    return null;
  }

  try {
    // Use a separate axios instance to avoid interceptor loops
    const response = await axios.post<{ token?: string; accessToken?: string; refreshToken: string }>(
      `${config.api.baseUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { token: tokenField, accessToken, refreshToken: newRefreshToken } = response.data;
    const token = accessToken || tokenField || null;

    if (!token) {
      return null;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
    }

    return token;
  } catch (error) {
    logger.error('Token refresh failed:', error);
    // Clear tokens on refresh failure
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
    return null;
  }
}

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: config.api.baseUrl,
    timeout: config.api.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null;

      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors and auto-refresh token
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If it's a 401 and we haven't already retried
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Don't retry refresh endpoint to avoid loops
        if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
          return Promise.reject(formatApiError(error));
        }

        // Skip token refresh for public endpoints that should fail gracefully
        // Note: Feed endpoints (/videos/friends, /videos/following, /user/videos) NEED refresh
        const skipRefreshPatterns = ['/videos/user/', '/users/'];
        const shouldSkipRefresh = skipRefreshPatterns.some(pattern => originalRequest.url?.includes(pattern));
        if (shouldSkipRefresh) {
          return Promise.reject(formatApiError(error));
        }

        if (isRefreshing) {
          // Wait for the ongoing refresh to complete
          return new Promise((resolve, reject) => {
            subscribeTokenRefresh((token: string) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(client(originalRequest));
              } else {
                reject(formatApiError(error));
              }
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAuthToken();
          isRefreshing = false;

          if (newToken) {
            onTokenRefreshed(newToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return client(originalRequest);
          } else {
            // Token refresh failed - but don't auto-logout
            // Let the user continue with degraded experience
            // They can manually logout if needed
            onTokenRefreshed('');
            return Promise.reject(formatApiError(error));
          }
        } catch (_refreshError) {
          isRefreshing = false;
          onTokenRefreshed('');
          return Promise.reject(formatApiError(error));
        }
      }

      const apiError = formatApiError(error);

      // Show user-facing toast for meaningful errors (skip background/auth/expected failures)
      if (typeof window !== 'undefined') {
        const url = originalRequest?.url || '';
        const status = error.response?.status || 0;

        // Don't toast for: auth checks, token refresh, 401s, 404s on optional resources, aborted requests
        const silentPatterns = ['/auth/', '/feed/', '/collections/check/', '/watch-later/check/', '/saved/check/'];
        const isSilent = silentPatterns.some(p => url.includes(p));
        const isExpected = status === 401 || status === 404 || status === 0;

        if (!isSilent && !isExpected && status >= 400) {
          try {
            useToastStore.getState().addToast(apiError.message);
          } catch {
            // Store may not be ready during SSR
          }
        }
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

const formatApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    const data = error.response.data as { message?: string; error?: string };
    return {
      message: data.message || data.error || 'An error occurred',
      code: error.code || 'UNKNOWN',
      status: error.response.status,
    };
  }

  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
      status: 0,
    };
  }

  return {
    message: error.message || 'Unknown error',
    code: 'UNKNOWN',
    status: 0,
  };
};

export const apiClient = createApiClient();
