/**
 * Gap #85: Feature Flags Service
 * Lightweight service layer that loads flags from localStorage or API,
 * supports URL param overrides for testing (?ff_feature=true),
 * and provides a simple isEnabled check.
 *
 * Works alongside the existing useFeatureFlags hook/context for
 * non-React contexts (services, utilities, etc).
 */

const STORAGE_KEY = 'vib3-feature-flags';

/** Default flags for all features */
const DEFAULT_FLAGS: Record<string, boolean> = {
  experimental_editor: false,
  advanced_filters: true,
  live_battles: true,
  ar_lenses: false,
  voice_commands: false,
  grid_recording: true,
  burst_photo: true,
  background_upload: true,
  offline_messaging: true,
  network_quality: true,
  capsule_delivery: true,
  collab_realtime: true,
  challenge_detail: true,
  haptic_feedback: true,
  data_saver: false,
  push_notifications: true,
  web3_features: false,
  nft_profiles: false,
  crypto_payments: false,
};

/** Load flags, merging defaults + localStorage + URL overrides */
function loadFlags(): Record<string, boolean> {
  const flags = { ...DEFAULT_FLAGS };

  // Load from localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(flags, parsed);
      }
    } catch {
      // Invalid stored data
    }
  }

  // URL param overrides: ?ff_feature_name=true/false
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      params.forEach((value, key) => {
        if (key.startsWith('ff_')) {
          const flagName = key.slice(3); // Remove ff_ prefix
          flags[flagName] = value === 'true' || value === '1';
        }
      });
    } catch {
      // URL parsing failed
    }
  }

  return flags;
}

class FeatureFlagService {
  private flags: Record<string, boolean>;

  constructor() {
    this.flags = loadFlags();
  }

  /** Check if a feature flag is enabled */
  isEnabled(flagName: string): boolean {
    return this.flags[flagName] ?? false;
  }

  /** Get all flag values */
  getAll(): Record<string, boolean> {
    return { ...this.flags };
  }

  /** Set a flag value and persist */
  setFlag(flagName: string, enabled: boolean): void {
    this.flags[flagName] = enabled;
    this.persist();
  }

  /** Toggle a flag */
  toggleFlag(flagName: string): void {
    this.flags[flagName] = !this.flags[flagName];
    this.persist();
  }

  /** Reset all flags to defaults */
  reset(): void {
    this.flags = { ...DEFAULT_FLAGS };
    this.persist();
  }

  /** Reload flags (e.g., after URL change) */
  reload(): void {
    this.flags = loadFlags();
  }

  /** Persist current flags to localStorage */
  private persist(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags));
      } catch {
        // Storage full
      }
    }
  }
}

/** Singleton instance */
export const featureFlagService = new FeatureFlagService();

/** Convenience function */
export function isFeatureEnabled(flagName: string): boolean {
  return featureFlagService.isEnabled(flagName);
}
