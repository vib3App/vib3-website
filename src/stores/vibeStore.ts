/**
 * Vibe Store - manages the selected vibe filter for the feed
 */
import { create } from 'zustand';

export type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational' | null;

export interface VibeOption {
  id: VibeType;
  label: string;
  emoji: string;
  color: string;
}

export const VIBES: VibeOption[] = [
  { id: 'Energetic', label: 'Energetic', emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
  { id: 'Chill', label: 'Chill', emoji: '😌', color: 'from-blue-400 to-cyan-500' },
  { id: 'Creative', label: 'Creative', emoji: '🎨', color: 'from-purple-500 to-pink-500' },
  { id: 'Social', label: 'Social', emoji: '👥', color: 'from-green-400 to-teal-500' },
  { id: 'Romantic', label: 'Romantic', emoji: '💕', color: 'from-pink-400 to-rose-500' },
  { id: 'Funny', label: 'Funny', emoji: '😂', color: 'from-amber-400 to-yellow-500' },
  { id: 'Inspirational', label: 'Inspiring', emoji: '✨', color: 'from-violet-400 to-purple-500' },
];

interface VibeState {
  selectedVibe: VibeType;
  setSelectedVibe: (vibe: VibeType) => void;
}

export const useVibeStore = create<VibeState>((set) => ({
  selectedVibe: null,
  setSelectedVibe: (vibe) => set({ selectedVibe: vibe }),
}));
