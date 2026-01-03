'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

interface AccessibilitySettings {
  autoPlayCaptions: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
  textScale: number;
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-white font-medium">{label}</p>
        {description && (
          <p className="text-white/50 text-xs mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          checked ? 'bg-purple-500' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function AccessibilitySettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    autoPlayCaptions: true,
    reduceMotion: false,
    highContrast: false,
    screenReaderOptimized: false,
    textScale: 1.0,
  });

  // Load settings
  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/accessibility');
      return;
    }

    // Load from localStorage
    try {
      const saved = localStorage.getItem('vib3_accessibility_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
    setIsLoading(false);
  }, [isAuthenticated, isAuthVerified, router]);

  // Save settings whenever they change
  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('vib3_accessibility_settings', JSON.stringify(newSettings));

    // Apply text scale to document
    if (updates.textScale !== undefined) {
      document.documentElement.style.fontSize = `${updates.textScale * 100}%`;
    }

    // Apply reduce motion preference
    if (updates.reduceMotion !== undefined) {
      document.documentElement.classList.toggle('reduce-motion', updates.reduceMotion);
    }

    // Apply high contrast mode
    if (updates.highContrast !== undefined) {
      document.documentElement.classList.toggle('high-contrast', updates.highContrast);
    }
  };

  // Apply saved settings on load
  useEffect(() => {
    if (!isLoading) {
      document.documentElement.style.fontSize = `${settings.textScale * 100}%`;
      document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
      document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    }
  }, [isLoading, settings.textScale, settings.reduceMotion, settings.highContrast]);

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const textScalePercent = Math.round(settings.textScale * 100);

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-heavy rounded-b-2xl border-b border-white/10 mx-4 mb-6">
          <div className="flex items-center gap-4 px-4 h-14">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-lg font-semibold text-white">Accessibility</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6">
              <ToggleSwitch
                label="Auto-play captions"
                description="Show captions automatically on videos"
                checked={settings.autoPlayCaptions}
                onChange={(checked) => updateSettings({ autoPlayCaptions: checked })}
              />

              <ToggleSwitch
                label="Reduce motion"
                description="Limit animations and transitions"
                checked={settings.reduceMotion}
                onChange={(checked) => updateSettings({ reduceMotion: checked })}
              />

              <ToggleSwitch
                label="High contrast"
                description="Increase color contrast for better visibility"
                checked={settings.highContrast}
                onChange={(checked) => updateSettings({ highContrast: checked })}
              />

              <ToggleSwitch
                label="Screen reader optimized"
                description="Optimize content for screen readers"
                checked={settings.screenReaderOptimized}
                onChange={(checked) => updateSettings({ screenReaderOptimized: checked })}
              />

              {/* Text Size Slider */}
              <div className="py-4 mt-4 border-t border-white/10">
                <h3 className="text-white font-bold mb-4">Text Size</h3>

                <div className="relative">
                  <input
                    type="range"
                    min="80"
                    max="150"
                    step="10"
                    value={textScalePercent}
                    onChange={(e) =>
                      updateSettings({ textScale: parseInt(e.target.value, 10) / 100 })
                    }
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${
                        ((textScalePercent - 80) / 70) * 100
                      }%, rgba(255,255,255,0.2) ${
                        ((textScalePercent - 80) / 70) * 100
                      }%, rgba(255,255,255,0.2) 100%)`,
                    }}
                  />

                  {/* Scale markers */}
                  <div className="flex justify-between mt-2">
                    <span className="text-white/40 text-xs">80%</span>
                    <span className="text-white/40 text-xs">100%</span>
                    <span className="text-white/40 text-xs">150%</span>
                  </div>
                </div>

                <p className="text-center text-white/70 mt-3">{textScalePercent}%</p>

                {/* Preview */}
                <div className="mt-4 p-4 rounded-xl bg-white/5">
                  <p className="text-white/50 text-xs mb-2">Preview:</p>
                  <p
                    className="text-white"
                    style={{ fontSize: `${settings.textScale}rem` }}
                  >
                    This is how text will appear at {textScalePercent}% size.
                  </p>
                </div>
              </div>

              {/* Info note */}
              <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-white/70 text-sm">
                  These settings will be applied across the app. Some settings may
                  require a page refresh to take full effect.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: #a855f7;
          border-radius: 50%;
          cursor: pointer;
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #a855f7;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
