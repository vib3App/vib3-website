/**
 * Axios API client with interceptors
 * Handles auth, error formatting, token refresh, and request/response processing
 */
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '@/config/env';

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
    const response = await axios.post<{ token: string; refreshToken: string }>(
      `${config.api.baseUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { token, refreshToken: newRefreshToken } = response.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken);
      }
    }

    return token;
  } catch (error) {
    console.error('Token refresh failed:', error);
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

        // Skip token refresh entirely for endpoints that should fail gracefully
        // These are either public endpoints or need special handling
        const skipRefreshPatterns = ['/auth/me', '/videos/user/', '/users/', '/videos/friends', '/user/videos'];
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
            // Token refresh failed - user needs to re-login
            onTokenRefreshed('');
            // Dispatch logout event for the app to handle
            // Skip for endpoints that shouldn't trigger full logout:
            // - /auth/me: AuthProvider handles that directly
            // - /videos/user/: Public profile videos, just fail gracefully
            // - /users/: Public user profiles, just fail gracefully
            // - /user/: Current user endpoints handled by profile page
            // Use setTimeout to defer event to avoid triggering during React render
            const skipLogoutPatterns = ['/auth/me', '/videos/user/', '/users/', '/user/'];
            const shouldSkipLogout = skipLogoutPatterns.some(pattern => originalRequest.url?.includes(pattern));
            if (typeof window !== 'undefined' && !shouldSkipLogout) {
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token_expired' } }));
              }, 0);
            }
            return Promise.reject(formatApiError(error));
          }
        } catch (refreshError) {
          isRefreshing = false;
          onTokenRefreshed('');
          return Promise.reject(formatApiError(error));
        }
      }

      return Promise.reject(formatApiError(error));
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
