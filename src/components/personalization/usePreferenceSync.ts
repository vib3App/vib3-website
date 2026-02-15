'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface SyncStatus {
  lastSynced: Date | null;
  isSyncing: boolean;
  error: string | null;
}

interface UserPreferences {
  theme: object;
  accessibility: object;
  notifications: object;
  privacy: object;
  content: object;
}

const PREFERENCE_KEYS = [
  'vib3-theme-config',
  'vib3-accessibility',
  'vib3-notifications',
  'vib3-privacy',
  'vib3-content',
];

export function usePreferenceSync() {
  const [status, setStatus] = useState<SyncStatus>({
    lastSynced: null,
    isSyncing: false,
    error: null,
  });
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

  // Load local preferences
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const prefs: UserPreferences = {
          theme: JSON.parse(localStorage.getItem(PREFERENCE_KEYS[0]) || '{}'),
          accessibility: JSON.parse(localStorage.getItem(PREFERENCE_KEYS[1]) || '{}'),
          notifications: JSON.parse(localStorage.getItem(PREFERENCE_KEYS[2]) || '{}'),
          privacy: JSON.parse(localStorage.getItem(PREFERENCE_KEYS[3]) || '{}'),
          content: JSON.parse(localStorage.getItem(PREFERENCE_KEYS[4]) || '{}'),
        };
        setPreferences(prefs);
      } catch (_e) {
        logger.error('Failed to load preferences');
      }
    };
    loadPreferences();
  }, []);

  // Sync to cloud (simulated)
  const syncToCloud = useCallback(async () => {
    if (!preferences) return;

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus({
        lastSynced: new Date(),
        isSyncing: false,
        error: null,
      });
    } catch (_error) {
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync. Please try again.',
      }));
    }
  }, [preferences]);

  // Sync from cloud (simulated)
  const syncFromCloud = useCallback(async () => {
    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus({
        lastSynced: new Date(),
        isSyncing: false,
        error: null,
      });
    } catch (_error) {
      setStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Failed to sync. Please try again.',
      }));
    }
  }, []);

  // Export preferences as JSON
  const exportPreferences = useCallback(() => {
    if (!preferences) return;

    const blob = new Blob([JSON.stringify(preferences, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vib3-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [preferences]);

  // Import preferences from JSON
  const importPreferences = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        Object.entries(imported).forEach(([key, value]) => {
          const storageKey = `vib3-${key}`;
          localStorage.setItem(storageKey, JSON.stringify(value));
        });
        setPreferences(imported);
        window.location.reload();
      } catch (_error) {
        setStatus(prev => ({ ...prev, error: 'Invalid preferences file' }));
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    status,
    preferences,
    syncToCloud,
    syncFromCloud,
    exportPreferences,
    importPreferences,
  };
}
