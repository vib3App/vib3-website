'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSocialStore } from '@/stores/socialStore';
import { userApi, videoApi } from '@/services/api';
import { uploadApi } from '@/services/api/upload';
import type { Video } from '@/types';
import type { VideoDraft } from '@/types/upload';
import { logger } from '@/utils/logger';
import type { ProfileTabType } from '@/components/profile/ProfileSections';

export interface UserProfile {
  _id: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  isVerified?: boolean;
  createdAt?: string;
  stats: { followers: number; following: number; likes: number; videos: number };
}

export function useProfile() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { user: currentUser, isAuthenticated, isAuthVerified } = useAuthStore();
  const {
    isFollowing: checkIsFollowing,
    toggleFollow,
    loadFollowedUsers,
    isLoaded: socialLoaded
  } = useSocialStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [likedVideos, _setLikedVideos] = useState<Video[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTabType>('videos');
  const [categoryFilter, setCategoryFilter] = useState('All');
  // GAP-12: State for new profile tabs
  const [drafts, setDrafts] = useState<VideoDraft[]>([]);
  const [scheduledVideos, setScheduledVideos] = useState<Array<{ id: string; caption: string; thumbnailUrl?: string; scheduledFor?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const isLoadingRef = useRef(false); // Prevent duplicate profile loads

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
    // Prevent duplicate concurrent loads
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      let profileData: UserProfile | null = null;

      // Try to get the profile
      if (isOwnProfile) {
        // Use getMyProfile for own profile (more reliable, uses auth token)
        profileData = await userApi.getMyProfile();
      } else {
        try {
          profileData = await userApi.getProfile(userId);
        } catch (profileErr: unknown) {
          // If fetching by ID fails and we're authenticated, try getMyProfile as fallback
          // This handles case where user.id in store is outdated
          const err = profileErr as { response?: { status: number } };
          if (isAuthenticated && (err.response?.status === 400 || err.response?.status === 404)) {
            try {
              const myProfile = await userApi.getMyProfile();
              // Check if this is actually the same user (by matching the URL userId)
              if (myProfile._id === userId) {
                profileData = myProfile;
              } else {
                throw profileErr; // Not our profile, rethrow original error
              }
            } catch {
              throw profileErr; // Fallback failed, rethrow original error
            }
          } else {
            throw profileErr;
          }
        }
      }

      if (!profileData) {
        throw new Error('Could not load profile');
      }

      setProfile(profileData);

      // Fetch videos - use getMyVideos for own profile (authenticated endpoint)
      try {
        let videosData;
        if (isOwnProfile) {
          videosData = await userApi.getMyVideos(1, 100);
        } else {
          videosData = await userApi.getUserVideos(profileData._id || userId);
        }
        setVideos(videosData.videos || []);
      } catch (videoErr) {
        logger.error('[useProfile] Failed to fetch videos:', videoErr);
        setVideos([]);
      }

      // Note: followed users are loaded in separate useEffect to avoid infinite loop
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { status: number } };
      logger.error('Profile load error:', error);
      if (error.response?.status === 404) {
        setError('User not found');
      } else if (error.response?.status === 400) {
        setError('Invalid user ID');
      } else if (error.response?.status === 401) {
        setError('Please log in to view this profile');
      } else {
        setError(error.message || 'Failed to load profile');
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [userId, isOwnProfile, isAuthenticated]);

  useEffect(() => {
    // Wait for auth to be verified before loading profile
    // This prevents API calls with stale/invalid tokens
    if (userId && isAuthVerified) {
      loadProfile();
    }
  }, [userId, isAuthVerified, loadProfile]);

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
      logger.error('Failed to follow/unfollow:', err);
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

  // GAP-12: Lazy-load drafts and scheduled videos when tab is selected
  useEffect(() => {
    if (!isOwnProfile) return;
    if (activeTab === 'drafts' && drafts.length === 0) {
      uploadApi.getDrafts().then(d => setDrafts(Array.isArray(d) ? d : [])).catch(err => logger.error('Failed to load drafts:', err));
    }
    if (activeTab === 'scheduled' && scheduledVideos.length === 0) {
      uploadApi.getScheduledVideos().then(v => setScheduledVideos(Array.isArray(v) ? v : [])).catch(err => logger.error('Failed to load scheduled:', err));
    }
  }, [activeTab, isOwnProfile, drafts.length, scheduledVideos.length]);

  const deleteVideo = useCallback(async (videoId: string) => {
    try {
      await videoApi.deleteVideo(videoId);
      // Remove the video from local state
      setVideos(prev => prev.filter(v => v.id !== videoId));
      // Update profile stats
      if (profile) {
        setProfile({
          ...profile,
          stats: { ...profile.stats, videos: Math.max(0, profile.stats.videos - 1) }
        });
      }
    } catch (err) {
      logger.error('Failed to delete video:', err);
      throw err;
    }
  }, [profile]);

  return {
    userId,
    profile,
    videos,
    likedVideos,
    drafts,
    scheduledVideos,
    activeTab,
    setActiveTab,
    categoryFilter,
    setCategoryFilter,
    isLoading: isLoading || !isAuthVerified, // Show loading while auth is being verified
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
    deleteVideo,
    goBack: () => router.back(),
  };
}
