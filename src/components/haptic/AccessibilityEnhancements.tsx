'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReaderMode: boolean;
  hapticFeedback: boolean;
  colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

const defaultSettings: AccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  largeText: false,
  screenReaderMode: false,
  hapticFeedback: true,
  colorBlindMode: 'none',
};

const AccessibilityContext = createContext<{
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
}>({
  settings: defaultSettings,
  updateSetting: () => {},
});

export function useAccessibility() {
  return useContext(AccessibilityContext);
}

/**
 * Accessibility settings provider
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load settings from localStorage during initialization
    if (typeof window === 'undefined') return defaultSettings;
    let loaded = defaultSettings;
    const saved = localStorage.getItem('vib3-accessibility');
    if (saved) {
      try {
        loaded = { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        // Invalid saved data, use defaults
      }
    }

    // Check system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      loaded = { ...loaded, reducedMotion: true };
    }
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      loaded = { ...loaded, highContrast: true };
    }
    return loaded;
  });

  // Save settings
  useEffect(() => {
    localStorage.setItem('vib3-accessibility', JSON.stringify(settings));

    // Apply CSS classes to root
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', settings.reducedMotion);
    root.classList.toggle('high-contrast', settings.highContrast);
    root.classList.toggle('large-text', settings.largeText);
    root.dataset.colorBlindMode = settings.colorBlindMode;
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Accessibility settings panel
 */
export function AccessibilityPanel({ className = '' }: { className?: string }) {
  const { settings, updateSetting } = useAccessibility();

  const colorBlindOptions: { id: AccessibilitySettings['colorBlindMode']; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'deuteranopia', label: 'Deuteranopia (Green)' },
    { id: 'protanopia', label: 'Protanopia (Red)' },
    { id: 'tritanopia', label: 'Tritanopia (Blue)' },
  ];

  return (
    <motion.div
      className={`glass-card p-6 rounded-2xl space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-white font-medium text-lg">Accessibility</h3>

      {/* Motion */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">Reduced Motion</div>
          <div className="text-white/50 text-sm">Minimize animations</div>
        </div>
        <ToggleSwitch
          checked={settings.reducedMotion}
          onChange={(v) => updateSetting('reducedMotion', v)}
        />
      </div>

      {/* Contrast */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">High Contrast</div>
          <div className="text-white/50 text-sm">Increase color contrast</div>
        </div>
        <ToggleSwitch
          checked={settings.highContrast}
          onChange={(v) => updateSetting('highContrast', v)}
        />
      </div>

      {/* Text Size */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">Large Text</div>
          <div className="text-white/50 text-sm">Increase text size</div>
        </div>
        <ToggleSwitch
          checked={settings.largeText}
          onChange={(v) => updateSetting('largeText', v)}
        />
      </div>

      {/* Screen Reader */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">Screen Reader Mode</div>
          <div className="text-white/50 text-sm">Optimize for screen readers</div>
        </div>
        <ToggleSwitch
          checked={settings.screenReaderMode}
          onChange={(v) => updateSetting('screenReaderMode', v)}
        />
      </div>

      {/* Haptic Feedback */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white">Haptic Feedback</div>
          <div className="text-white/50 text-sm">Vibration on interactions</div>
        </div>
        <ToggleSwitch
          checked={settings.hapticFeedback}
          onChange={(v) => updateSetting('hapticFeedback', v)}
        />
      </div>

      {/* Color Blind Mode */}
      <div>
        <div className="text-white mb-2">Color Blind Mode</div>
        <div className="grid grid-cols-2 gap-2">
          {colorBlindOptions.map((option) => (
            <motion.button
              key={option.id}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                settings.colorBlindMode === option.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              onClick={() => updateSetting('colorBlindMode', option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {option.label}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <motion.button
      className={`w-12 h-6 rounded-full p-1 transition-colors ${
        checked ? 'bg-purple-500' : 'bg-white/10'
      }`}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        animate={{ x: checked ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

/**
 * Focus indicator for keyboard navigation
 */
export function FocusRing({ children }: { children: ReactNode }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="relative"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-lg border-2 border-purple-500 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Skip navigation link for screen readers
 */
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-500 focus:text-white
                 focus:rounded-lg focus:outline-none"
    >
      Skip to main content
    </a>
  );
}

/**
 * Live region for screen reader announcements
 */
export function LiveAnnouncer() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setMessage(e.detail);
      setTimeout(() => setMessage(''), 1000);
    };

    window.addEventListener('announce' as never, handler);
    return () => window.removeEventListener('announce' as never, handler);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Helper to announce messages
export function announce(message: string) {
  window.dispatchEvent(new CustomEvent('announce', { detail: message }));
}

export default AccessibilityPanel;
