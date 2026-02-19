'use client';

import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import useTheme from '@/hooks/useTheme';
import type { ThemeMode, AccentColor } from '@/hooks/useTheme';

const THEME_MODES: { value: ThemeMode; label: string; desc: string }[] = [
  { value: 'dark', label: 'Dark', desc: 'Default dark theme' },
  { value: 'light', label: 'Light', desc: 'Light mode for daytime' },
  { value: 'system', label: 'System', desc: 'Follow device settings' },
  { value: 'oled', label: 'OLED Black', desc: 'True black for OLED screens' },
];

const ACCENT_COLORS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'purple', label: 'Purple', color: '#a855f7' },
  { value: 'pink', label: 'Pink', color: '#ec4899' },
  { value: 'blue', label: 'Blue', color: '#3b82f6' },
  { value: 'green', label: 'Green', color: '#22c55e' },
  { value: 'orange', label: 'Orange', color: '#f97316' },
  { value: 'red', label: 'Red', color: '#ef4444' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
];

export default function AppearancePage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
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

  if (!isAuthVerified) return null;
  if (!isAuthenticated) { router.push('/login?redirect=/settings/appearance'); return null; }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy mx-4 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Appearance</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Theme Mode */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Theme</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {THEME_MODES.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setMode(mode.value)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                >
                  <div>
                    <span className="text-white text-sm">{mode.label}</span>
                    <span className="text-white/40 text-xs block">{mode.desc}</span>
                  </div>
                  {config.mode === mode.value && (
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Accent Color */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Accent Color</h3>
            <div className="glass-card rounded-2xl p-4">
              <div className="grid grid-cols-4 gap-3">
                {ACCENT_COLORS.map((ac) => (
                  <button
                    key={ac.value}
                    onClick={() => setAccent(ac.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition ${
                      config.accent === ac.value ? 'bg-white/10 ring-2 ring-white/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: ac.color }} />
                    <span className="text-white/70 text-xs">{ac.label}</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    const color = prompt('Enter a hex color (e.g., #ff6600)');
                    if (color && /^#[0-9a-fA-F]{6}$/.test(color)) {
                      setAccent('custom', color);
                    }
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition ${
                    config.accent === 'custom' ? 'bg-white/10 ring-2 ring-white/30' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
                  <span className="text-white/70 text-xs">Custom</span>
                </button>
              </div>
            </div>
          </section>

          {/* Glass & Blur */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Visual Effects</h3>
            <div className="glass-card rounded-2xl p-4 space-y-4">
              <div>
                <label className="text-white text-sm flex justify-between mb-2">
                  <span>Glass Opacity</span>
                  <span className="text-white/50">{Math.round(config.glassOpacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={config.glassOpacity * 100}
                  onChange={(e) => setGlassOpacity(parseInt(e.target.value) / 100)}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="text-white text-sm flex justify-between mb-2">
                  <span>Blur Intensity</span>
                  <span className="text-white/50">{config.blurIntensity}px</span>
                </label>
                <input
                  type="range"
                  min="0" max="50" step="5"
                  value={config.blurIntensity}
                  onChange={(e) => setBlurIntensity(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="text-white text-sm flex justify-between mb-2">
                  <span>Animation Speed</span>
                  <span className="text-white/50">{config.animationSpeed}x</span>
                </label>
                <input
                  type="range"
                  min="0" max="200" step="10"
                  value={config.animationSpeed * 100}
                  onChange={(e) => setAnimationSpeed(parseInt(e.target.value) / 100)}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </section>

          {/* Border Radius */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Border Style</h3>
            <div className="glass-card rounded-2xl p-4">
              <div className="flex gap-3">
                {(['sharp', 'rounded', 'pill'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setBorderRadius(r)}
                    className={`flex-1 py-3 text-center text-sm capitalize transition ${
                      config.borderRadius === r
                        ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl'
                        : 'bg-white/10 text-white/60 hover:bg-white/20 rounded-xl'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Reset */}
          <button
            onClick={resetToDefaults}
            className="w-full py-3 bg-white/10 text-white/70 rounded-2xl text-sm font-medium hover:bg-white/20 transition"
          >
            Reset to Defaults
          </button>
        </div>
      </main>
    </div>
  );
}
