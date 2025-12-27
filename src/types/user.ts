/**
 * User-related type definitions
 */

export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  likeCount: number;
  videoCount: number;
  isFollowing?: boolean;
  createdAt: string;
}

export interface AuthUser extends User {
  email: string;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  birthDate: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}
