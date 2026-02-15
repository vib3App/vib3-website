/**
 * Social store - manages follow relationships, likes, etc.
 * Caches social data to avoid repeated API calls
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userApi } from '@/services/api/user';
import { logger } from '@/utils/logger';

interface SocialState {
  followedUserIds: Set<string>;
  likedVideoIds: Set<string>;
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched: number | null;
}

interface SocialActions {
  loadFollowedUsers: (forceRefresh?: boolean) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  followUser: (userId: string) => Promise<boolean>;
  unfollowUser: (userId: string) => Promise<boolean>;
  toggleFollow: (userId: string) => Promise<boolean>;
  addLikedVideo: (videoId: string) => void;
  removeLikedVideo: (videoId: string) => void;
  isVideoLiked: (videoId: string) => boolean;
  reset: () => void;
}

type SocialStore = SocialState & SocialActions;

// Cache expiry time: 5 minutes
const CACHE_EXPIRY = 5 * 60 * 1000;

export const useSocialStore = create<SocialStore>()(
  persist(
    (set, get) => ({
      // State
      followedUserIds: new Set<string>(),
      likedVideoIds: new Set<string>(),
      isLoaded: false,
      isLoading: false,
      lastFetched: null,

      // Actions
      loadFollowedUsers: async (forceRefresh = false) => {
        const state = get();
        const now = Date.now();

        // Skip if already loading
        if (state.isLoading) return;

        // Skip if cache is still valid (unless force refresh)
        if (!forceRefresh && state.isLoaded && state.lastFetched && now - state.lastFetched < CACHE_EXPIRY) {
          // Cache still valid
          return;
        }

        set({ isLoading: true });

        try {
          const followedIds = await userApi.getFollowedUsers();
          set({
            followedUserIds: new Set(followedIds),
            isLoaded: true,
            isLoading: false,
            lastFetched: now,
          });
        } catch (error) {
          logger.error('[SocialStore] Failed to load followed users:', error);
          set({ isLoading: false });
        }
      },

      isFollowing: (userId: string) => {
        return get().followedUserIds.has(userId);
      },

      followUser: async (userId: string) => {
        try {
          await userApi.followUser(userId);
          set((state) => ({
            followedUserIds: new Set([...state.followedUserIds, userId]),
          }));
          return true;
        } catch (error) {
          logger.error('Failed to follow user:', error);
          return false;
        }
      },

      unfollowUser: async (userId: string) => {
        try {
          await userApi.unfollowUser(userId);
          set((state) => {
            const newSet = new Set(state.followedUserIds);
            newSet.delete(userId);
            return { followedUserIds: newSet };
          });
          return false;
        } catch (error) {
          logger.error('Failed to unfollow user:', error);
          return true;
        }
      },

      toggleFollow: async (userId: string) => {
        const isCurrentlyFollowing = get().isFollowing(userId);
        if (isCurrentlyFollowing) {
          return get().unfollowUser(userId);
        } else {
          return get().followUser(userId);
        }
      },

      addLikedVideo: (videoId: string) => {
        set((state) => ({
          likedVideoIds: new Set([...state.likedVideoIds, videoId]),
        }));
      },

      removeLikedVideo: (videoId: string) => {
        set((state) => {
          const newSet = new Set(state.likedVideoIds);
          newSet.delete(videoId);
          return { likedVideoIds: newSet };
        });
      },

      isVideoLiked: (videoId: string) => {
        return get().likedVideoIds.has(videoId);
      },

      reset: () => {
        set({
          followedUserIds: new Set(),
          likedVideoIds: new Set(),
          isLoaded: false,
          isLoading: false,
          lastFetched: null,
        });
      },
    }),
    {
      name: 'vib3-social',
      partialize: (state) => ({
        // Convert Sets to arrays for JSON serialization
        followedUserIds: Array.from(state.followedUserIds),
        likedVideoIds: Array.from(state.likedVideoIds),
        lastFetched: state.lastFetched,
      }),
      // merge converts persisted arrays back to Sets before they enter the store.
      // This replaces onRehydrateStorage which ran too late — components could
      // see raw arrays (deserialized from JSON) before the mutation happened,
      // causing .has() calls to throw.
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown> | undefined;
        if (!p) return current;

        const followedRaw = p.followedUserIds;
        const likedRaw = p.likedVideoIds;

        const followedUserIds = Array.isArray(followedRaw)
          ? new Set<string>(followedRaw)
          : current.followedUserIds;

        const likedVideoIds = Array.isArray(likedRaw)
          ? new Set<string>(likedRaw)
          : current.likedVideoIds;

        return {
          ...current,
          followedUserIds,
          likedVideoIds,
          lastFetched: (p.lastFetched as number | null) ?? current.lastFetched,
          isLoaded: followedUserIds.size > 0 || likedVideoIds.size > 0,
        };
      },
    }
  )
);
