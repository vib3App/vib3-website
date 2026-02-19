'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';

const STORAGE_KEY = 'vib3-download-settings';

interface DownloadSettings {
  quality: 'auto' | 'high' | 'medium' | 'low';
  wifiOnly: boolean;
  storageLimit: number; // in MB
  autoDelete: boolean;
  autoDeleteDays: number;
}

const DEFAULT_SETTINGS: DownloadSettings = {
  quality: 'auto',
  wifiOnly: true,
  storageLimit: 2048, // 2GB
  autoDelete: false,
  autoDeleteDays: 30,
};

const QUALITY_OPTIONS = [
  { value: 'auto', label: 'Auto', desc: 'Best quality for your connection' },
  { value: 'high', label: 'High (1080p)', desc: 'Best quality, larger file size' },
  { value: 'medium', label: 'Medium (720p)', desc: 'Good quality, moderate size' },
  { value: 'low', label: 'Low (480p)', desc: 'Smallest file size' },
];

const STORAGE_LIMITS = [
  { value: 512, label: '512 MB' },
  { value: 1024, label: '1 GB' },
  { value: 2048, label: '2 GB' },
  { value: 5120, label: '5 GB' },
  { value: 10240, label: '10 GB' },
  { value: 0, label: 'Unlimited' },
];

export default function DownloadsSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [settings, setSettings] = useState<DownloadSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  const updateSettings = (updates: Partial<DownloadSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!isAuthVerified) return null;
  if (!isAuthenticated) { router.push('/login?redirect=/settings/downloads'); return null; }

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
            <h1 className="text-xl font-bold text-white">Downloads</h1>
            {saved && <span className="text-green-400 text-sm ml-auto">Saved!</span>}
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Quality */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Download Quality</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ quality: opt.value as DownloadSettings['quality'] })}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                >
                  <div>
                    <span className="text-white text-sm">{opt.label}</span>
                    <span className="text-white/40 text-xs block">{opt.desc}</span>
                  </div>
                  {settings.quality === opt.value && (
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* WiFi Only */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Network</h3>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-white text-sm block">Wi-Fi Only</span>
                  <span className="text-white/40 text-xs">Only download when connected to Wi-Fi</span>
                </div>
                <button
                  onClick={() => updateSettings({ wifiOnly: !settings.wifiOnly })}
                  className={`w-12 h-7 rounded-full relative transition-colors ${settings.wifiOnly ? 'bg-purple-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${settings.wifiOnly ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Storage Limit */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Storage Limit</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {STORAGE_LIMITS.map((limit) => (
                <button
                  key={limit.value}
                  onClick={() => updateSettings({ storageLimit: limit.value })}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                >
                  <span className="text-white text-sm">{limit.label}</span>
                  {settings.storageLimit === limit.value && (
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Auto Delete */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Auto Delete</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-white text-sm block">Auto Delete Old Downloads</span>
                  <span className="text-white/40 text-xs">Remove downloads after a set period</span>
                </div>
                <button
                  onClick={() => updateSettings({ autoDelete: !settings.autoDelete })}
                  className={`w-12 h-7 rounded-full relative transition-colors ${settings.autoDelete ? 'bg-purple-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${settings.autoDelete ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              {settings.autoDelete && (
                <div className="px-4 py-3">
                  <label className="text-white text-sm flex justify-between mb-2">
                    <span>Delete after</span>
                    <span className="text-white/50">{settings.autoDeleteDays} days</span>
                  </label>
                  <input
                    type="range"
                    min="7" max="90" step="7"
                    value={settings.autoDeleteDays}
                    onChange={(e) => updateSettings({ autoDeleteDays: parseInt(e.target.value) })}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-white/30 text-xs mt-1">
                    <span>7 days</span>
                    <span>90 days</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Info */}
          <div className="text-center text-white/30 text-xs py-4">
            <p>Downloads are stored locally on your device.</p>
            <p>Web downloads use your browser&apos;s storage.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
