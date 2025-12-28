'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTheme, type AccentColor, type ThemeMode } from '@/hooks/useTheme';

interface ThemeCustomizerProps {
  className?: string;
  compact?: boolean;
}

const modeOptions: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'light', label: 'Light', icon: '☀️' },
  { id: 'dark', label: 'Dark', icon: '🌙' },
  { id: 'oled', label: 'OLED', icon: '⬛' },
  { id: 'system', label: 'Auto', icon: '🔄' },
];

const accentOptions: { id: AccentColor; color: string; label: string }[] = [
  { id: 'purple', color: '#a855f7', label: 'Purple' },
  { id: 'pink', color: '#ec4899', label: 'Pink' },
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'cyan', color: '#06b6d4', label: 'Cyan' },
  { id: 'green', color: '#22c55e', label: 'Green' },
  { id: 'orange', color: '#f97316', label: 'Orange' },
  { id: 'red', color: '#ef4444', label: 'Red' },
];

/**
 * Full theme customization panel
 */
export function ThemeCustomizer({ className = '', compact = false }: ThemeCustomizerProps) {
  const {
    config,
    setMode,
    setAccent,
    setGlassOpacity,
    setBlurIntensity,
    setAnimationSpeed,
    setBorderRadius,
    resetToDefaults,
  } = useTheme();

  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState('#a855f7');

  return (
    <motion.div
      className={`glass-card p-6 rounded-2xl space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium text-lg">Theme</h3>
        <motion.button
          className="text-white/50 text-sm hover:text-white"
          onClick={resetToDefaults}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      </div>

      {/* Mode Selection */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Appearance</label>
        <div className="grid grid-cols-4 gap-2">
          {modeOptions.map((option) => (
            <motion.button
              key={option.id}
              className={`p-3 rounded-xl text-center transition-colors ${
                config.mode === option.id
                  ? 'bg-purple-500/30 border border-purple-500/50'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setMode(option.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-xl mb-1">{option.icon}</div>
              <div className="text-xs text-white/70">{option.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Accent Color</label>
        <div className="flex flex-wrap gap-2">
          {accentOptions.map((option) => (
            <motion.button
              key={option.id}
              className={`w-10 h-10 rounded-full relative ${
                config.accent === option.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
              }`}
              style={{ backgroundColor: option.color }}
              onClick={() => setAccent(option.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title={option.label}
            />
          ))}
          <motion.button
            className={`w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 relative ${
              config.accent === 'custom' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''
            }`}
            onClick={() => setShowCustomColor(!showCustomColor)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Custom"
          />
        </div>

        <AnimatePresence>
          {showCustomColor && (
            <motion.div
              className="mt-3 flex items-center gap-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer"
              />
              <motion.button
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm"
                onClick={() => setAccent('custom', customColor)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Apply
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!compact && (
        <>
          {/* Glass Effect */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white/50 text-sm">Glass Opacity</label>
              <span className="text-white/50 text-sm">{Math.round(config.glassOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.glassOpacity * 100}
              onChange={(e) => setGlassOpacity(parseInt(e.target.value) / 100)}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Blur Intensity */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white/50 text-sm">Blur Intensity</label>
              <span className="text-white/50 text-sm">{config.blurIntensity}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={config.blurIntensity}
              onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Animation Speed */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white/50 text-sm">Animation Speed</label>
              <span className="text-white/50 text-sm">{config.animationSpeed}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={config.animationSpeed * 100}
              onChange={(e) => setAnimationSpeed(parseInt(e.target.value) / 100)}
              className="w-full accent-purple-500"
            />
          </div>

          {/* Border Radius */}
          <div>
            <label className="text-white/50 text-sm block mb-2">Corner Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sharp', 'rounded', 'pill'] as const).map((style) => (
                <motion.button
                  key={style}
                  className={`p-3 text-center transition-colors capitalize ${
                    config.borderRadius === style
                      ? 'bg-purple-500/30 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  style={{
                    borderRadius: style === 'sharp' ? '4px' : style === 'pill' ? '9999px' : '12px',
                  }}
                  onClick={() => setBorderRadius(style)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-white/70 text-sm">{style}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Preview */}
      <div>
        <label className="text-white/50 text-sm block mb-2">Preview</label>
        <div
          className="p-4 rounded-xl"
          style={{
            background: `rgba(255, 255, 255, ${config.glassOpacity})`,
            backdropFilter: `blur(${config.blurIntensity}px)`,
            borderRadius: config.borderRadius === 'sharp' ? '4px' : config.borderRadius === 'pill' ? '24px' : '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }}
            />
            <div>
              <div className="text-white text-sm font-medium">Sample Card</div>
              <div className="text-white/50 text-xs">Your theme preview</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact theme toggle for navbar
 */
export function ThemeToggle() {
  const { config, setMode } = useTheme();

  const cycleMode = () => {
    const modes: ThemeMode[] = ['dark', 'light', 'oled'];
    const currentIndex = modes.indexOf(config.mode === 'system' ? 'dark' : config.mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  const icons: Record<ThemeMode, string> = {
    dark: '🌙',
    light: '☀️',
    oled: '⬛',
    system: '🔄',
  };

  return (
    <motion.button
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
      onClick={cycleMode}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={`Current: ${config.mode}`}
    >
      <span className="text-lg">{icons[config.mode]}</span>
    </motion.button>
  );
}

export default ThemeCustomizer;
