/**
 * Auth store - manages authentication state
 * Uses Zustand for minimal global state
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthVerified: boolean; // True after AuthProvider has verified token
}

interface AuthActions {
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setAuthVerified: (verified: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

/**
 * Extract user ID from profile picture URL as fallback
 * URL format: profile-{userId}-{timestamp}.jpg
 */
function extractUserIdFromProfilePic(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/profile-([a-f0-9]{24})-/i);
  return match ? match[1] : null;
}

/**
 * Ensure user has an ID (migration for old stored users without id)
 */
function migrateUser(user: AuthUser | null): AuthUser | null {
  if (!user) return null;

  // If user already has id, return as-is
  if (user.id) return user;

  // Try to extract ID from profile picture URL
  const extractedId = extractUserIdFromProfilePic(user.profilePicture);
  if (extractedId) {
    console.log('Migrated user ID from profile picture:', extractedId);
    return { ...user, id: extractedId };
  }

  return user;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State - Start with isLoading: false to prevent flash/loops
      // The persist middleware will restore any saved auth state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAuthVerified: false, // Not verified until AuthProvider checks

      // Actions
      setUser: (user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', user.token);
        }
        // Ensure user has ID before storing
        const migratedUser = migrateUser(user) || user;
        set({ user: migratedUser, isAuthenticated: true, isLoading: false, isAuthVerified: true });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
        set({ user: null, isAuthenticated: false, isLoading: false, isAuthVerified: true });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setAuthVerified: (isAuthVerified) => set({ isAuthVerified }),
    }),
    {
      name: 'vib3-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Migrate stored user data on rehydration - don't set isLoading
      onRehydrateStorage: () => (state) => {
        if (state?.user && !state.user.id) {
          const migratedUser = migrateUser(state.user);
          if (migratedUser?.id) {
            state.user = migratedUser;
          }
        }
      },
    }
  )
);
