'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { usePreferenceSync } from './usePreferenceSync';

interface PreferenceSyncPanelProps {
  className?: string;
}

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

      {status.lastSynced && (
        <div className="text-white/40 text-sm">
          Last synced: {status.lastSynced.toLocaleString()}
        </div>
      )}

      {status.error && (
        <motion.div
          className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {status.error}
        </motion.div>
      )}

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
