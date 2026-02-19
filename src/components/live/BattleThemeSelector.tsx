'use client';

import { useState, useCallback } from 'react';
import { PaintBrushIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface BattleTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    border: string;
  };
  font: string;
  borderStyle: string;
  soundPack: string;
  preview: string;
}

const BATTLE_THEMES: BattleTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    colors: { primary: '#A855F7', secondary: '#14B8A6', accent: '#FACC15', background: 'rgba(0,0,0,0.8)', border: 'rgba(255,255,255,0.1)' },
    font: 'font-sans',
    borderStyle: 'border-solid',
    soundPack: 'default',
    preview: 'linear-gradient(135deg, #A855F7, #14B8A6)',
  },
  {
    id: 'neon',
    name: 'Neon',
    colors: { primary: '#FF00FF', secondary: '#00FFFF', accent: '#00FF00', background: 'rgba(10,0,20,0.9)', border: 'rgba(255,0,255,0.3)' },
    font: 'font-mono',
    borderStyle: 'border-double',
    soundPack: 'synth',
    preview: 'linear-gradient(135deg, #FF00FF, #00FFFF)',
  },
  {
    id: 'fire_ice',
    name: 'Fire & Ice',
    colors: { primary: '#FF4500', secondary: '#00BFFF', accent: '#FFD700', background: 'rgba(20,0,0,0.9)', border: 'rgba(255,69,0,0.3)' },
    font: 'font-sans',
    borderStyle: 'border-solid',
    soundPack: 'elemental',
    preview: 'linear-gradient(135deg, #FF4500, #00BFFF)',
  },
  {
    id: 'arcade',
    name: 'Arcade',
    colors: { primary: '#FACC15', secondary: '#EF4444', accent: '#22C55E', background: 'rgba(0,0,40,0.9)', border: 'rgba(250,204,21,0.3)' },
    font: 'font-mono',
    borderStyle: 'border-dashed',
    soundPack: 'retro',
    preview: 'linear-gradient(135deg, #FACC15, #EF4444)',
  },
  {
    id: 'boxing_ring',
    name: 'Boxing Ring',
    colors: { primary: '#DC2626', secondary: '#1D4ED8', accent: '#F59E0B', background: 'rgba(30,10,0,0.9)', border: 'rgba(220,38,38,0.4)' },
    font: 'font-sans',
    borderStyle: 'border-solid',
    soundPack: 'boxing',
    preview: 'linear-gradient(135deg, #DC2626, #1D4ED8)',
  },
];

interface BattleThemeSelectorProps {
  selectedTheme: BattleTheme;
  onSelectTheme: (theme: BattleTheme) => void;
}

export function BattleThemeSelector({ selectedTheme, onSelectTheme }: BattleThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback((theme: BattleTheme) => {
    onSelectTheme(theme);
    setIsOpen(false);
    // Persist selection
    try { localStorage.setItem('vib3_battle_theme', theme.id); } catch {}
  }, [onSelectTheme]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 glass rounded-full hover:bg-white/10 transition text-white text-sm"
        title="Battle Theme"
      >
        <PaintBrushIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{selectedTheme.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 w-72 glass-card rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white font-semibold text-sm">Battle Theme</span>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition">
                <XMarkIcon className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="p-3 space-y-2">
              {BATTLE_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleSelect(theme)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                    selectedTheme.id === theme.id
                      ? 'bg-white/10 ring-1 ring-purple-500/50'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0"
                    style={{ background: theme.preview }}
                  />
                  <div className="text-left flex-1">
                    <p className={`text-white text-sm font-medium ${theme.font}`}>
                      {theme.name}
                    </p>
                    <p className="text-white/40 text-xs">
                      {theme.borderStyle.replace('border-', '')} borders
                    </p>
                  </div>
                  {selectedTheme.id === theme.id && (
                    <svg className="w-5 h-5 text-purple-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** Helper hook to manage battle theme state */
export function useBattleTheme() {
  const [theme, setTheme] = useState<BattleTheme>(() => {
    if (typeof window === 'undefined') return BATTLE_THEMES[0];
    try {
      const saved = localStorage.getItem('vib3_battle_theme');
      return BATTLE_THEMES.find((t) => t.id === saved) || BATTLE_THEMES[0];
    } catch {
      return BATTLE_THEMES[0];
    }
  });

  return { theme, setTheme, themes: BATTLE_THEMES };
}
