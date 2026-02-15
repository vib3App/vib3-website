'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system' | 'oled';
export type AccentColor = 'purple' | 'pink' | 'blue' | 'green' | 'orange' | 'red' | 'cyan' | 'custom';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
  customAccent?: string;
  glassOpacity: number;
  blurIntensity: number;
  animationSpeed: number;
  borderRadius: 'sharp' | 'rounded' | 'pill';
}

const accentColors: Record<AccentColor, { primary: string; secondary: string }> = {
  purple: { primary: '#a855f7', secondary: '#ec4899' },
  pink: { primary: '#ec4899', secondary: '#f43f5e' },
  blue: { primary: '#3b82f6', secondary: '#06b6d4' },
  green: { primary: '#22c55e', secondary: '#10b981' },
  orange: { primary: '#f97316', secondary: '#eab308' },
  red: { primary: '#ef4444', secondary: '#f97316' },
  cyan: { primary: '#06b6d4', secondary: '#3b82f6' },
  custom: { primary: '#a855f7', secondary: '#ec4899' },
};

const defaultConfig: ThemeConfig = {
  mode: 'dark',
  accent: 'purple',
  glassOpacity: 0.1,
  blurIntensity: 20,
  animationSpeed: 1,
  borderRadius: 'rounded',
};

const STORAGE_KEY = 'vib3-theme-config';

/**
 * Comprehensive theme management hook
 */
function loadConfigFromStorage(): { config: ThemeConfig; isLoaded: boolean } {
  if (typeof window === 'undefined') return { config: defaultConfig, isLoaded: false };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { config: { ...defaultConfig, ...JSON.parse(saved) }, isLoaded: true };
    }
  } catch (_e) {
    // Invalid saved data
  }
  return { config: defaultConfig, isLoaded: true };
}

export function useTheme() {
  const [{ config, isLoaded }, setConfigState] = useState(loadConfigFromStorage);

  const setConfig: React.Dispatch<React.SetStateAction<ThemeConfig>> = useCallback(
    (action) => {
      setConfigState((prev) => ({
        ...prev,
        config: typeof action === 'function' ? action(prev.config) : action,
      }));
    },
    []
  );

  // Save config to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, isLoaded]);

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;

    // Mode
    let effectiveMode = config.mode;
    if (config.mode === 'system') {
      effectiveMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.remove('dark', 'light', 'oled');
    root.classList.add(effectiveMode === 'oled' ? 'dark' : effectiveMode);
    root.dataset.theme = effectiveMode;

    // Accent colors
    const accent = config.accent === 'custom' && config.customAccent
      ? { primary: config.customAccent, secondary: config.customAccent }
      : accentColors[config.accent];

    root.style.setProperty('--color-primary', accent.primary);
    root.style.setProperty('--color-secondary', accent.secondary);

    // Glass effects
    root.style.setProperty('--glass-opacity', config.glassOpacity.toString());
    root.style.setProperty('--blur-intensity', `${config.blurIntensity}px`);

    // Animation speed
    root.style.setProperty('--animation-speed', config.animationSpeed.toString());

    // Border radius
    const radiusValues = {
      sharp: '4px',
      rounded: '12px',
      pill: '9999px',
    };
    root.style.setProperty('--border-radius', radiusValues[config.borderRadius]);

    // OLED mode - true black
    if (effectiveMode === 'oled') {
      root.style.setProperty('--bg-base', '#000000');
      root.style.setProperty('--bg-surface', '#0a0a0a');
    } else if (effectiveMode === 'dark') {
      root.style.setProperty('--bg-base', '#0f0f0f');
      root.style.setProperty('--bg-surface', '#1a1a1a');
    } else {
      root.style.setProperty('--bg-base', '#ffffff');
      root.style.setProperty('--bg-surface', '#f5f5f5');
    }

  }, [config, isLoaded]);

  // Derive full color palette from config
  const colors = useMemo<ThemeColors | null>(() => {
    if (!isLoaded) return null;

    let effectiveMode = config.mode;
    if (config.mode === 'system') {
      effectiveMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    const accent = config.accent === 'custom' && config.customAccent
      ? { primary: config.customAccent, secondary: config.customAccent }
      : accentColors[config.accent];

    return {
      primary: accent.primary,
      secondary: accent.secondary,
      accent: accent.primary,
      background: effectiveMode === 'light' ? '#ffffff' : '#0f0f0f',
      surface: effectiveMode === 'light' ? '#f5f5f5' : '#1a1a1a',
      text: effectiveMode === 'light' ? '#0f0f0f' : '#ffffff',
      textSecondary: effectiveMode === 'light' ? '#666666' : '#a0a0a0',
    };
  }, [config, isLoaded]);

  // Update handlers
  const setMode = useCallback((mode: ThemeMode) => {
    setConfig(prev => ({ ...prev, mode }));
  }, [setConfig]);

  const setAccent = useCallback((accent: AccentColor, customColor?: string) => {
    setConfig(prev => ({
      ...prev,
      accent,
      customAccent: accent === 'custom' ? customColor : prev.customAccent,
    }));
  }, [setConfig]);

  const setGlassOpacity = useCallback((opacity: number) => {
    setConfig(prev => ({ ...prev, glassOpacity: Math.max(0, Math.min(1, opacity)) }));
  }, [setConfig]);

  const setBlurIntensity = useCallback((intensity: number) => {
    setConfig(prev => ({ ...prev, blurIntensity: Math.max(0, Math.min(50, intensity)) }));
  }, [setConfig]);

  const setAnimationSpeed = useCallback((speed: number) => {
    setConfig(prev => ({ ...prev, animationSpeed: Math.max(0, Math.min(2, speed)) }));
  }, [setConfig]);

  const setBorderRadius = useCallback((radius: ThemeConfig['borderRadius']) => {
    setConfig(prev => ({ ...prev, borderRadius: radius }));
  }, [setConfig]);

  const resetToDefaults = useCallback(() => {
    setConfig(defaultConfig);
  }, [setConfig]);

  return {
    config,
    colors,
    isLoaded,
    setMode,
    setAccent,
    setGlassOpacity,
    setBlurIntensity,
    setAnimationSpeed,
    setBorderRadius,
    resetToDefaults,
  };
}

/**
 * Hook for time-based theme adjustments
 */
export function useTimeBasedTheme() {
  const { setMode, config: _config } = useTheme();
  const [autoEnabled, setAutoEnabled] = useState(false);

  useEffect(() => {
    if (!autoEnabled) return;

    const checkTime = () => {
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 6) {
        setMode('oled'); // Late night - OLED black
      } else if (hour >= 6 && hour < 8) {
        setMode('light'); // Morning - gentle light
      } else {
        setMode('dark'); // Day - standard dark
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [autoEnabled, setMode]);

  return { autoEnabled, setAutoEnabled };
}

export default useTheme;
