/**
 * Auth API service
 * Handles login, register, OAuth, and token refresh
 */
import { apiClient, ApiError } from './client';
import type { AuthUser, LoginCredentials, RegisterData } from '@/types';

interface AuthResponse {
  token: string;
  refreshToken: string;
  // User data can be nested in 'user' object or at top level
  user?: {
    _id: string;
    username: string;
    email: string;
    profilePicture?: string;
    isVerified?: boolean;
  };
  // Or at top level (some API responses)
  _id?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  isVerified?: boolean;
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
   * Request password reset email
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
    return data;
  },

  /**
   * Reset password with token from email
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      password: newPassword,
    });
    return data;
  },

  /**
   * Change password for logged-in user
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/verify-email', { token });
    return data;
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>('/auth/resend-verification');
    return data;
  },

  /**
   * Get current user profile
   */
  async getMe(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get<AuthResponse>('/auth/me');
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;

      // Handle both nested user object and top-level fields
      const userId = data.user?._id || data._id || '';
      const username = data.user?.username || data.username || '';
      const email = data.user?.email || data.email || '';
      const profilePicture = data.user?.profilePicture || data.profilePicture;
      const isVerified = data.user?.isVerified || data.isVerified || false;

      return {
        id: userId,
        username,
        email,
        profilePicture,
        isVerified,
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

  // Handle both nested user object and top-level fields
  const userId = data.user?._id || data._id || '';
  const username = data.user?.username || data.username || '';
  const email = data.user?.email || data.email || '';
  const profilePicture = data.user?.profilePicture || data.profilePicture;
  const isVerified = data.user?.isVerified || data.isVerified || false;

  console.log('Auth transform - extracted userId:', userId, 'from data:', {
    nested: data.user?._id,
    topLevel: data._id
  });

  return {
    id: userId,
    username,
    email,
    profilePicture,
    isVerified,
    token: data.token,
    refreshToken: data.refreshToken,
  };
}
