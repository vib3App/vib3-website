'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';
import { userApi } from '@/services/api';
import type { Video } from '@/types';

export interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  stats: { followers: number; following: number; likes: number; videos: number };
}

export function useProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const {
    isFollowing: checkIsFollowing,
    toggleFollow,
    loadFollowedUsers,
    isLoaded: socialLoaded
  } = useSocialStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [likedVideos, setLikedVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'liked'>('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isOwnProfile = currentUser?.id === userId;
  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/profile/${userId}` : '';

  // Get follow status from social store
  const isFollowing = checkIsFollowing(userId);

  // Load followed users when authenticated
  useEffect(() => {
    if (isAuthenticated && !socialLoaded) {
      loadFollowedUsers();
    }
  }, [isAuthenticated, socialLoaded, loadFollowedUsers]);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const profileData = await userApi.getProfile(userId);
      setProfile(profileData);

      try {
        const videosData = await userApi.getUserVideos(userId);
        setVideos(videosData.videos || []);
      } catch {
        setVideos([]);
      }

      // Load followed users if not already loaded
      if (isAuthenticated && !socialLoaded) {
        loadFollowedUsers();
      }
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { status: number } };
      if (error.response?.status === 404) {
        setError('User not found');
      } else if (error.response?.status === 400) {
        setError('Invalid user ID');
      } else {
        setError(error.message || 'Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isAuthenticated, socialLoaded, loadFollowedUsers]);

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId, loadProfile]);

  const handleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsFollowLoading(true);
    try {
      const newFollowState = await toggleFollow(userId);

      if (profile) {
        setProfile({
          ...profile,
          stats: { ...profile.stats, followers: profile.stats.followers + (newFollowState ? 1 : -1) }
        });
      }
    } catch (err) {
      console.error('Failed to follow/unfollow:', err);
    } finally {
      setIsFollowLoading(false);
    }
  }, [isAuthenticated, userId, profile, router, toggleFollow]);

  const copyProfileLink = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    setShowMoreMenu(false);
  }, [profileUrl]);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (profile) setProfile({ ...profile, ...updates });
  }, [profile]);

  return {
    userId,
    profile,
    videos,
    likedVideos,
    activeTab,
    setActiveTab,
    isLoading,
    error,
    isFollowing,
    isFollowLoading,
    showEditModal,
    setShowEditModal,
    showQRModal,
    setShowQRModal,
    showMoreMenu,
    setShowMoreMenu,
    isOwnProfile,
    isAuthenticated,
    profileUrl,
    handleFollow,
    copyProfileLink,
    updateProfile,
    goBack: () => router.back(),
  };
}
