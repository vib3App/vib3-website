/**
 * Auth API service
 * Handles login, register, OAuth, and token refresh
 */
import { apiClient, ApiError } from './client';
import type { AuthUser, LoginCredentials, RegisterData } from '@/types';

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export const authApi = {
  /**
   * Login with email/password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return transformAuthResponse(data);
  },

  /**
   * Register new account
   */
  async register(userData: RegisterData): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      ...userData,
      birthdate: userData.birthdate || '2000-01-01', // Backend requires birthdate (13+ verification)
    });
    return transformAuthResponse(data);
  },

  /**
   * Google OAuth login
   */
  async googleLogin(idToken: string): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>('/auth/google', { idToken });
    return transformAuthResponse(data);
  },

  /**
   * Apple OAuth login
   */
  async appleLogin(params: {
    idToken: string;
    authorizationCode: string;
    fullName?: { givenName?: string; familyName?: string };
  }): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>('/auth/apple', params);
    return transformAuthResponse(data);
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    const { data } = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  /**
   * Logout - invalidate token
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore errors on logout - clear local state anyway
    }
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<{ user: AuthResponse['user'] }>('/auth/me');
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      return {
        id: data.user._id,
        username: data.user.username,
        email: data.user.email,
        profilePicture: data.user.profilePicture,
        isVerified: data.user.isVerified || false,
        token: token || '',
        refreshToken: refreshToken || '',
      };
    } catch {
      return null;
    }
  },
};

function transformAuthResponse(data: AuthResponse): AuthUser {
  // Store refresh token separately
  if (typeof window !== 'undefined' && data.refreshToken) {
    localStorage.setItem('refresh_token', data.refreshToken);
  }

  return {
    id: data.user._id,
    username: data.user.username,
    email: data.user.email,
    profilePicture: data.user.profilePicture,
    isVerified: data.user.isVerified || false,
    token: data.token,
    refreshToken: data.refreshToken,
  };
}
