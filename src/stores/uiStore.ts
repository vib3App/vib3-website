/**
 * UI store - manages global UI state
 * Keeps UI state separate from data state
 */
import { create } from 'zustand';

interface UIState {
  isMuted: boolean;
  volume: number;
  isSidebarOpen: boolean;
  isFullscreen: boolean;
  theme: 'dark' | 'light';
}

interface UIActions {
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  // State - muted by default for autoplay
  isMuted: true,
  volume: 1,
  isSidebarOpen: false,
  isFullscreen: false,
  theme: 'dark',

  // Actions
  setMuted: (isMuted) => set({ isMuted }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setFullscreen: (isFullscreen) => set({ isFullscreen }),
  setTheme: (theme) => set({ theme }),
}));
