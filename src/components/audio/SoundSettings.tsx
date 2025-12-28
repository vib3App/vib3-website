'use client';

import { motion } from 'framer-motion';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useAmbientSound, type AmbientMode } from '@/hooks/useAmbientSound';

interface SoundSettingsProps {
  className?: string;
}

const ambientModes: { id: AmbientMode; label: string; icon: string; description: string }[] = [
  { id: 'off', label: 'Off', icon: '🔇', description: 'No ambient sound' },
  { id: 'focus', label: 'Focus', icon: '🎯', description: 'Deep concentration tones' },
  { id: 'energy', label: 'Energy', icon: '⚡', description: 'Upbeat, motivating vibes' },
  { id: 'chill', label: 'Chill', icon: '🌊', description: 'Relaxing, calm atmosphere' },
  { id: 'nature', label: 'Nature', icon: '🌿', description: 'Natural, organic sounds' },
];

/**
 * Sound settings panel for controlling UI sounds and ambient audio
 */
export function SoundSettings({ className = '' }: SoundSettingsProps) {
  const { enabled: sfxEnabled, setEnabled: setSfxEnabled, volume: sfxVolume, setVolume: setSfxVolume, playClick } = useSoundEffects();
  const { mode: ambientMode, setMode: setAmbientMode, volume: ambientVolume, setVolume: setAmbientVolume, autoMode } = useAmbientSound();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* UI Sound Effects */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-medium">UI Sound Effects</h3>
            <p className="text-white/50 text-sm">Clicks, notifications, and feedback</p>
          </div>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              sfxEnabled ? 'bg-purple-500' : 'bg-white/10'
            }`}
            onClick={() => {
              setSfxEnabled(!sfxEnabled);
              if (!sfxEnabled) playClick();
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: sfxEnabled ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        {sfxEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm w-16">Volume</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sfxVolume * 100}
                onChange={(e) => setSfxVolume(parseInt(e.target.value) / 100)}
                className="flex-1 accent-purple-500"
              />
              <span className="text-white/50 text-sm w-10">{Math.round(sfxVolume * 100)}%</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Ambient Soundscapes */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-medium">Ambient Soundscapes</h3>
            <p className="text-white/50 text-sm">Background audio for your vibe</p>
          </div>
          <motion.button
            className="px-3 py-1 text-sm rounded-full glass text-purple-400 hover:text-purple-300"
            onClick={autoMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Auto
          </motion.button>
        </div>

        {/* Mode selection */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {ambientModes.map((modeOption) => (
            <motion.button
              key={modeOption.id}
              className={`p-3 rounded-xl text-center transition-colors ${
                ambientMode === modeOption.id
                  ? 'bg-purple-500/30 border border-purple-500/50'
                  : 'glass hover:bg-white/10'
              }`}
              onClick={() => setAmbientMode(modeOption.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl mb-1">{modeOption.icon}</div>
              <div className="text-xs text-white/70">{modeOption.label}</div>
            </motion.button>
          ))}
        </div>

        {ambientMode !== 'off' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <p className="text-white/50 text-sm">
              {ambientModes.find(m => m.id === ambientMode)?.description}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm w-16">Volume</span>
              <input
                type="range"
                min="0"
                max="100"
                value={ambientVolume * 100}
                onChange={(e) => setAmbientVolume(parseInt(e.target.value) / 100)}
                className="flex-1 accent-purple-500"
              />
              <span className="text-white/50 text-sm w-10">{Math.round(ambientVolume * 100)}%</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Quick sound toggle for navbar/header
 */
export function SoundToggle() {
  const { enabled, setEnabled, playClick } = useSoundEffects();

  return (
    <motion.button
      className={`p-2 rounded-lg transition-colors ${
        enabled ? 'text-purple-400' : 'text-white/40'
      }`}
      onClick={() => {
        if (!enabled) playClick();
        setEnabled(!enabled);
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      )}
    </motion.button>
  );
}

export default SoundSettings;
