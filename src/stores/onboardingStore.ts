import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasCompleted: boolean;
  selectedInterests: string[];
  followedUsers: string[];
  setCompleted: () => void;
  setInterests: (interests: string[]) => void;
  addFollowedUser: (userId: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompleted: false,
      selectedInterests: [],
      followedUsers: [],
      setCompleted: () => set({ hasCompleted: true }),
      setInterests: (interests) => set({ selectedInterests: interests }),
      addFollowedUser: (userId) => set((state) => ({
        followedUsers: [...state.followedUsers, userId],
      })),
      reset: () => set({ hasCompleted: false, selectedInterests: [], followedUsers: [] }),
    }),
    { name: 'vib3-onboarding' }
  )
);
