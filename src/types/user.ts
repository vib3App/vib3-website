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

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  isVerified: boolean;
  token: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  birthdate?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}
