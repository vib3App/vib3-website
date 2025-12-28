'use client';

import { useCallback, useEffect, useState } from 'react';

interface FeatureUsage {
  id: string;
  count: number;
  lastUsed: number;
  avgTimeSpent: number;
}

interface UsagePatterns {
  features: Record<string, FeatureUsage>;
  timeOfDayUsage: Record<number, number>; // Hour -> usage count
  preferredActions: string[];
  sessionCount: number;
  totalTimeSpent: number;
}

const STORAGE_KEY = 'vib3-usage-patterns';

const defaultPatterns: UsagePatterns = {
  features: {},
  timeOfDayUsage: {},
  preferredActions: [],
  sessionCount: 0,
  totalTimeSpent: 0,
};

/**
 * Hook for tracking user behavior and adapting UI
 */
export function useAdaptiveUI() {
  const [patterns, setPatterns] = useState<UsagePatterns>(defaultPatterns);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load patterns from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPatterns(JSON.parse(saved));
      }
    } catch (e) {
      // Invalid data
    }
    setIsLoaded(true);
  }, []);

  // Save patterns to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
    }
  }, [patterns, isLoaded]);

  // Track feature usage
  const trackFeature = useCallback((featureId: string, timeSpent: number = 0) => {
    setPatterns(prev => {
      const existing = prev.features[featureId] || {
        id: featureId,
        count: 0,
        lastUsed: 0,
        avgTimeSpent: 0,
      };

      const newCount = existing.count + 1;
      const newAvgTime = (existing.avgTimeSpent * existing.count + timeSpent) / newCount;

      return {
        ...prev,
        features: {
          ...prev.features,
          [featureId]: {
            id: featureId,
            count: newCount,
            lastUsed: Date.now(),
            avgTimeSpent: newAvgTime,
          },
        },
      };
    });
  }, []);

  // Track time of day usage
  const trackTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    setPatterns(prev => ({
      ...prev,
      timeOfDayUsage: {
        ...prev.timeOfDayUsage,
        [hour]: (prev.timeOfDayUsage[hour] || 0) + 1,
      },
    }));
  }, []);

  // Get top features by usage
  const getTopFeatures = useCallback((limit: number = 5): FeatureUsage[] => {
    return Object.values(patterns.features)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }, [patterns.features]);

  // Get recently used features
  const getRecentFeatures = useCallback((limit: number = 5): FeatureUsage[] => {
    return Object.values(patterns.features)
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, limit);
  }, [patterns.features]);

  // Get peak usage hours
  const getPeakHours = useCallback((): number[] => {
    return Object.entries(patterns.timeOfDayUsage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }, [patterns.timeOfDayUsage]);

  // Suggest features based on context
  const getSuggestedFeatures = useCallback((): string[] => {
    const hour = new Date().getHours();
    const topFeatures = getTopFeatures(10);
    const recentFeatures = getRecentFeatures(3);

    // Combine top and recent, prioritize recent
    const suggested = new Set<string>();
    recentFeatures.forEach(f => suggested.add(f.id));
    topFeatures.forEach(f => suggested.add(f.id));

    return Array.from(suggested).slice(0, 5);
  }, [getTopFeatures, getRecentFeatures]);

  // Check if user is a power user of a feature
  const isPowerUser = useCallback((featureId: string): boolean => {
    const usage = patterns.features[featureId];
    if (!usage) return false;
    return usage.count >= 10 && usage.avgTimeSpent > 30;
  }, [patterns.features]);

  // Reset patterns
  const resetPatterns = useCallback(() => {
    setPatterns(defaultPatterns);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    patterns,
    trackFeature,
    trackTimeOfDay,
    getTopFeatures,
    getRecentFeatures,
    getPeakHours,
    getSuggestedFeatures,
    isPowerUser,
    resetPatterns,
    isLoaded,
  };
}

/**
 * Smart shortcuts that appear based on context
 */
export function useSmartShortcuts() {
  const { getSuggestedFeatures, isPowerUser } = useAdaptiveUI();
  const [shortcuts, setShortcuts] = useState<string[]>([]);

  useEffect(() => {
    const suggested = getSuggestedFeatures();
    setShortcuts(suggested);
  }, [getSuggestedFeatures]);

  return { shortcuts, isPowerUser };
}

export default useAdaptiveUI;
