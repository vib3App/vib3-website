/**
 * Action Button Store
 * Manages customizable action button preferences with persistence
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActionButtonPreferences,
  ButtonId,
  ButtonSize,
  LayoutType,
  Position,
  ButtonConfig,
} from '@/types/actionButtons';
import { DEFAULT_PREFERENCES, DEFAULT_BUTTONS } from '@/types/actionButtons';

interface ActionButtonState {
  // Preferences
  preferences: ActionButtonPreferences;
  mobilePreferences: ActionButtonPreferences; // Separate prefs for mobile

  // UI State
  isDragging: boolean;
  isSettingsOpen: boolean;
  activeButtonId: ButtonId | null; // Currently being dragged
}

interface ActionButtonActions {
  // Layout
  setLayout: (layout: LayoutType, isMobile?: boolean) => void;

  // Size
  setSize: (size: ButtonSize, isMobile?: boolean) => void;

  // Button visibility & order
  toggleButton: (id: ButtonId, isMobile?: boolean) => void;
  reorderButtons: (fromIndex: number, toIndex: number, isMobile?: boolean) => void;

  // Positioning
  setContainerPosition: (position: Position, isMobile?: boolean) => void;
  setButtonPosition: (id: ButtonId, position: Position, isMobile?: boolean) => void;

  // Drag state
  setDragging: (dragging: boolean, buttonId?: ButtonId | null) => void;

  // Settings panel
  openSettings: () => void;
  closeSettings: () => void;

  // Reset
  resetToDefault: (isMobile?: boolean) => void;
  resetAll: () => void;

  // Helpers
  getPreferences: (isMobile: boolean) => ActionButtonPreferences;
  getVisibleButtons: (isMobile: boolean) => ButtonConfig[];
}

type ActionButtonStore = ActionButtonState & ActionButtonActions;

export const useActionButtonStore = create<ActionButtonStore>()(
  persist(
    (set, get) => ({
      // Initial state
      preferences: { ...DEFAULT_PREFERENCES },
      mobilePreferences: { ...DEFAULT_PREFERENCES },
      isDragging: false,
      isSettingsOpen: false,
      activeButtonId: null,

      // Layout
      setLayout: (layout, isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set((state) => ({
          [key]: { ...state[key], layout },
        }));
      },

      // Size
      setSize: (size, isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set((state) => ({
          [key]: { ...state[key], size },
        }));
      },

      // Toggle button visibility
      toggleButton: (id, isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set((state) => ({
          [key]: {
            ...state[key],
            buttons: state[key].buttons.map((btn) =>
              btn.id === id ? { ...btn, visible: !btn.visible } : btn
            ),
          },
        }));
      },

      // Reorder buttons
      reorderButtons: (fromIndex, toIndex, isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set((state) => {
          const buttons = [...state[key].buttons];
          const [removed] = buttons.splice(fromIndex, 1);
          buttons.splice(toIndex, 0, removed);
          // Update order values
          const reordered = buttons.map((btn, i) => ({ ...btn, order: i }));
          return {
            [key]: { ...state[key], buttons: reordered },
          };
        });
      },

      // Set container position (for non-floating layouts)
      setContainerPosition: (position, isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set((state) => ({
          [key]: { ...state[key], containerPosition: position },
        }));
      },

      // Set individual button position (for floating layout)
      setButtonPosition: (id, position, isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set((state) => ({
          [key]: {
            ...state[key],
            positions: { ...state[key].positions, [id]: position },
          },
        }));
      },

      // Drag state
      setDragging: (dragging, buttonId = null) => {
        set({ isDragging: dragging, activeButtonId: buttonId });
      },

      // Settings panel
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      // Reset
      resetToDefault: (isMobile = false) => {
        const key = isMobile ? 'mobilePreferences' : 'preferences';
        set({ [key]: { ...DEFAULT_PREFERENCES } });
      },

      resetAll: () => {
        set({
          preferences: { ...DEFAULT_PREFERENCES },
          mobilePreferences: { ...DEFAULT_PREFERENCES },
          isDragging: false,
          isSettingsOpen: false,
          activeButtonId: null,
        });
      },

      // Helper to get preferences based on device
      getPreferences: (isMobile) => {
        const state = get();
        return isMobile ? state.mobilePreferences : state.preferences;
      },

      // Get visible buttons sorted by order
      getVisibleButtons: (isMobile) => {
        const state = get();
        const prefs = isMobile ? state.mobilePreferences : state.preferences;
        return prefs.buttons
          .filter((btn) => btn.visible)
          .sort((a, b) => a.order - b.order);
      },
    }),
    {
      name: 'vib3-action-buttons',
      partialize: (state) => ({
        preferences: state.preferences,
        mobilePreferences: state.mobilePreferences,
      }),
    }
  )
);

// Hook to detect mobile and get appropriate preferences
export function useIsMobileWeb(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}
