'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

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

/**
 * Hook for syncing preferences across devices
 */
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
        const keys = ['vib3-theme-config', 'vib3-accessibility', 'vib3-notifications', 'vib3-privacy', 'vib3-content'];
        const prefs: UserPreferences = {
          theme: JSON.parse(localStorage.getItem(keys[0]) || '{}'),
          accessibility: JSON.parse(localStorage.getItem(keys[1]) || '{}'),
          notifications: JSON.parse(localStorage.getItem(keys[2]) || '{}'),
          privacy: JSON.parse(localStorage.getItem(keys[3]) || '{}'),
          content: JSON.parse(localStorage.getItem(keys[4]) || '{}'),
        };
        setPreferences(prefs);
      } catch (e) {
        console.error('Failed to load preferences');
      }
    };
    loadPreferences();
  }, []);

  // Sync to cloud (simulated)
  const syncToCloud = useCallback(async () => {
    if (!preferences) return;

    setStatus(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real app, would call API here
      // await api.syncPreferences(preferences);

      setStatus({
        lastSynced: new Date(),
        isSyncing: false,
        error: null,
      });
    } catch (error) {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real app, would fetch from API
      // const cloudPrefs = await api.getPreferences();

      setStatus({
        lastSynced: new Date(),
        isSyncing: false,
        error: null,
      });
    } catch (error) {
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
        // Apply imported preferences
        Object.entries(imported).forEach(([key, value]) => {
          const storageKey = `vib3-${key}`;
          localStorage.setItem(storageKey, JSON.stringify(value));
        });
        setPreferences(imported);
        window.location.reload(); // Reload to apply all preferences
      } catch (error) {
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

interface PreferenceSyncPanelProps {
  className?: string;
}

/**
 * UI panel for preference sync management
 */
export function PreferenceSyncPanel({ className = '' }: PreferenceSyncPanelProps) {
  const {
    status,
    syncToCloud,
    syncFromCloud,
    exportPreferences,
    importPreferences,
  } = usePreferenceSync();

  const [showImport, setShowImport] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPreferences(file);
    }
  };

  return (
    <motion.div
      className={`glass-card p-6 rounded-2xl space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-medium">Sync Preferences</h3>
          <p className="text-white/50 text-sm">Keep your settings across devices</p>
        </div>
        <motion.div
          className={`w-3 h-3 rounded-full ${
            status.isSyncing
              ? 'bg-yellow-500'
              : status.error
                ? 'bg-red-500'
                : 'bg-green-500'
          }`}
          animate={status.isSyncing ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: status.isSyncing ? Infinity : 0 }}
        />
      </div>

      {/* Last synced */}
      {status.lastSynced && (
        <div className="text-white/40 text-sm">
          Last synced: {status.lastSynced.toLocaleString()}
        </div>
      )}

      {/* Error message */}
      {status.error && (
        <motion.div
          className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status.error}
        </motion.div>
      )}

      {/* Sync buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-xl
                     text-purple-300 flex flex-col items-center gap-2"
          onClick={syncToCloud}
          disabled={status.isSyncing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">☁️</span>
          <span className="text-sm">Backup to Cloud</span>
        </motion.button>

        <motion.button
          className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl
                     text-blue-300 flex flex-col items-center gap-2"
          onClick={syncFromCloud}
          disabled={status.isSyncing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-2xl">📥</span>
          <span className="text-sm">Restore from Cloud</span>
        </motion.button>
      </div>

      {/* Export/Import */}
      <div className="pt-4 border-t border-white/10">
        <div className="text-white/50 text-sm mb-3">Manual Backup</div>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            className="p-3 bg-white/5 rounded-xl text-white/70 text-sm
                       hover:bg-white/10 transition-colors"
            onClick={exportPreferences}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📤 Export JSON
          </motion.button>

          <motion.button
            className="p-3 bg-white/5 rounded-xl text-white/70 text-sm
                       hover:bg-white/10 transition-colors"
            onClick={() => setShowImport(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📥 Import JSON
          </motion.button>
        </div>

        {showImport && (
          <motion.div
            className="mt-3 p-3 bg-white/5 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="w-full text-white/70 text-sm file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0 file:bg-purple-500 file:text-white
                        file:cursor-pointer"
            />
          </motion.div>
        )}
      </div>

      {/* Sync indicator */}
      {status.isSyncing && (
        <motion.div
          className="flex items-center justify-center gap-2 text-white/50 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          Syncing...
        </motion.div>
      )}
    </motion.div>
  );
}

export default PreferenceSyncPanel;
