'use client';

import React, { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react';

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  stage: 'alpha' | 'beta' | 'stable';
  rolloutPercentage: number;
}

interface FeatureFlagsConfig {
  // Visual Effects
  liquidGlass: boolean;
  depthEffects: boolean;
  motionAnimations: boolean;
  particleEffects: boolean;
  cursorEffects: boolean;

  // Audio
  spatialAudio: boolean;
  ambientSounds: boolean;
  hapticFeedback: boolean;

  // AI Features
  aiRecommendations: boolean;
  moodDetection: boolean;
  trendPrediction: boolean;
  videoSummaries: boolean;

  // Personalization
  customThemes: boolean;
  profileBadges: boolean;
  preferenceSync: boolean;

  // Future Tech
  arFilters: boolean;
  web3Integration: boolean;
  nftProfiles: boolean;
  cryptoPayments: boolean;

  // Experimental
  voiceCommands: boolean;
  gestureNavigation: boolean;
  watchParty: boolean;
}

const defaultFlags: FeatureFlagsConfig = {
  // Visual - All enabled
  liquidGlass: true,
  depthEffects: true,
  motionAnimations: true,
  particleEffects: true,
  cursorEffects: true,

  // Audio - Enabled but can be toggled
  spatialAudio: true,
  ambientSounds: true,
  hapticFeedback: true,

  // AI - Enabled
  aiRecommendations: true,
  moodDetection: true,
  trendPrediction: true,
  videoSummaries: true,

  // Personalization - Enabled
  customThemes: true,
  profileBadges: true,
  preferenceSync: true,

  // Future Tech - Beta
  arFilters: false,
  web3Integration: false,
  nftProfiles: false,
  cryptoPayments: false,

  // Experimental - Alpha
  voiceCommands: false,
  gestureNavigation: false,
  watchParty: true,
};

const featureMetadata: Record<keyof FeatureFlagsConfig, Omit<FeatureFlag, 'id' | 'enabled'>> = {
  liquidGlass: { name: 'Liquid Glass', description: 'Glassmorphism effects throughout the UI', stage: 'stable', rolloutPercentage: 100 },
  depthEffects: { name: '3D Depth Effects', description: 'Parallax and depth effects', stage: 'stable', rolloutPercentage: 100 },
  motionAnimations: { name: 'Motion Animations', description: 'Page transitions and micro-interactions', stage: 'stable', rolloutPercentage: 100 },
  particleEffects: { name: 'Particle Effects', description: '3D particle backgrounds and celebrations', stage: 'stable', rolloutPercentage: 100 },
  cursorEffects: { name: 'Cursor Effects', description: 'Custom cursor trails and spotlights', stage: 'stable', rolloutPercentage: 100 },

  spatialAudio: { name: 'Spatial Audio', description: '3D audio positioning in live streams', stage: 'stable', rolloutPercentage: 100 },
  ambientSounds: { name: 'Ambient Sounds', description: 'Background soundscapes', stage: 'stable', rolloutPercentage: 100 },
  hapticFeedback: { name: 'Haptic Feedback', description: 'Vibration feedback on mobile', stage: 'stable', rolloutPercentage: 100 },

  aiRecommendations: { name: 'AI Recommendations', description: 'Personalized content suggestions', stage: 'stable', rolloutPercentage: 100 },
  moodDetection: { name: 'Mood Detection', description: 'Time-based mood UI adaptation', stage: 'stable', rolloutPercentage: 100 },
  trendPrediction: { name: 'Trend Prediction', description: 'AI-predicted rising trends', stage: 'stable', rolloutPercentage: 100 },
  videoSummaries: { name: 'Video Summaries', description: 'AI-generated video descriptions', stage: 'stable', rolloutPercentage: 100 },

  customThemes: { name: 'Custom Themes', description: 'Full theme customization', stage: 'stable', rolloutPercentage: 100 },
  profileBadges: { name: 'Profile Badges', description: 'Collectible profile badges', stage: 'stable', rolloutPercentage: 100 },
  preferenceSync: { name: 'Preference Sync', description: 'Cross-device settings sync', stage: 'stable', rolloutPercentage: 100 },

  arFilters: { name: 'AR Filters', description: 'Augmented reality camera filters', stage: 'beta', rolloutPercentage: 25 },
  web3Integration: { name: 'Web3 Integration', description: 'Wallet connection and crypto', stage: 'beta', rolloutPercentage: 10 },
  nftProfiles: { name: 'NFT Profiles', description: 'Use NFTs as profile pictures', stage: 'beta', rolloutPercentage: 10 },
  cryptoPayments: { name: 'Crypto Payments', description: 'Tip creators with crypto', stage: 'alpha', rolloutPercentage: 5 },

  voiceCommands: { name: 'Voice Commands', description: 'Control app with voice', stage: 'alpha', rolloutPercentage: 1 },
  gestureNavigation: { name: 'Gesture Navigation', description: 'Advanced gesture controls', stage: 'alpha', rolloutPercentage: 5 },
  watchParty: { name: 'Watch Party', description: 'Watch videos with friends', stage: 'beta', rolloutPercentage: 50 },
};

const FeatureFlagsContext = createContext<{
  flags: FeatureFlagsConfig;
  isEnabled: (flag: keyof FeatureFlagsConfig) => boolean;
  toggleFlag: (flag: keyof FeatureFlagsConfig) => void;
  getAllFlags: () => FeatureFlag[];
}>({
  flags: defaultFlags,
  isEnabled: () => false,
  toggleFlag: () => {},
  getAllFlags: () => [],
});

export function useFeatureFlags() {
  return useContext(FeatureFlagsContext);
}

interface FeatureFlagsProviderProps {
  children: ReactNode;
  overrides?: Partial<FeatureFlagsConfig>;
}

/**
 * Feature flags provider component
 */
export function FeatureFlagsProvider({ children, overrides }: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<FeatureFlagsConfig>({ ...defaultFlags, ...overrides });

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vib3-feature-flags');
      if (saved) {
        setFlags(prev => ({ ...prev, ...JSON.parse(saved), ...overrides }));
      }
    } catch (_e) {
      // Invalid saved data
    }
  }, [overrides]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('vib3-feature-flags', JSON.stringify(flags));
  }, [flags]);

  const isEnabled = useCallback((flag: keyof FeatureFlagsConfig) => {
    return flags[flag];
  }, [flags]);

  const toggleFlag = useCallback((flag: keyof FeatureFlagsConfig) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const getAllFlags = useCallback((): FeatureFlag[] => {
    return Object.entries(flags).map(([id, enabled]) => ({
      id,
      enabled,
      ...featureMetadata[id as keyof FeatureFlagsConfig],
    }));
  }, [flags]);

  const value = { flags, isEnabled, toggleFlag, getAllFlags };

  return React.createElement(
    FeatureFlagsContext.Provider,
    { value },
    children
  );
}

/**
 * HOC to conditionally render based on feature flag
 */
export function withFeatureFlag<P extends object>(
  flag: keyof FeatureFlagsConfig,
  WrappedComponent: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlaggedComponent(props: P) {
    const { isEnabled } = useFeatureFlags();

    if (!isEnabled(flag)) {
      return FallbackComponent ? React.createElement(FallbackComponent, props) : null;
    }

    return React.createElement(WrappedComponent, props);
  };
}

export default useFeatureFlags;
