/**
 * Auth API service
 * Handles login, register, OAuth, and token refresh
 */
import { apiClient } from './client';
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
    isAdmin?: boolean;
    role?: string;
  };
  // Or at top level (some API responses)
  _id?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  role?: string;
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
   * Snapchat OAuth login - exchange authorization code for session
   */
  async snapchatLogin(code: string, redirectUri: string): Promise<AuthUser> {
    const { data } = await apiClient.post<AuthResponse>('/auth/snapchat', { code, redirectUri });
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
    } finally {
      // Always clear tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      }
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
      // MongoDB _id can be string or { $oid: string } depending on serialization
      const rawId = data.user?._id || data._id;
      const userId = typeof rawId === 'object' && rawId !== null && '$oid' in rawId
        ? (rawId as { $oid: string }).$oid
        : String(rawId || '');

      const username = data.user?.username || data.username || '';
      const email = data.user?.email || data.email || '';
      const rawProfilePicture = data.user?.profilePicture || data.profilePicture;
      // Guard against null string values in profile pictures
      const profilePicture = rawProfilePicture && rawProfilePicture !== 'null' ? rawProfilePicture : undefined;
      const isVerified = data.user?.isVerified || data.isVerified || false;
      const role = data.user?.role || data.role;
      // Check both isAdmin flag and role === 'admin' or 'owner'
      const isAdmin = data.user?.isAdmin || data.isAdmin || role === 'admin' || role === 'owner' || false;

      return {
        id: userId,
        username,
        email,
        profilePicture,
        isVerified,
        isAdmin,
        role,
        token: token || '',
        refreshToken: refreshToken || '',
      };
    } catch {
      return null;
    }
  },
};

function transformAuthResponse(data: AuthResponse): AuthUser {
  // Store tokens for request interceptor
  if (typeof window !== 'undefined') {
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    if (data.refreshToken) {
      localStorage.setItem('refresh_token', data.refreshToken);
    }
  }

  // Handle both nested user object and top-level fields
  // MongoDB _id can be string or { $oid: string } depending on serialization
  const rawId = data.user?._id || data._id;
  const userId = typeof rawId === 'object' && rawId !== null && '$oid' in rawId
    ? (rawId as { $oid: string }).$oid
    : String(rawId || '');

  const username = data.user?.username || data.username || '';
  const email = data.user?.email || data.email || '';
  const rawProfilePicture = data.user?.profilePicture || data.profilePicture;
  // Guard against null string values in profile pictures
  const profilePicture = rawProfilePicture && rawProfilePicture !== 'null' ? rawProfilePicture : undefined;
  const isVerified = data.user?.isVerified || data.isVerified || false;
  const role = data.user?.role || data.role;
  // Check both isAdmin flag and role === 'admin' or 'owner'
  const isAdmin = data.user?.isAdmin || data.isAdmin || role === 'admin' || role === 'owner' || false;

  return {
    id: userId,
    username,
    email,
    profilePicture,
    isVerified,
    isAdmin,
    role,
    token: data.token,
    refreshToken: data.refreshToken,
  };
}
