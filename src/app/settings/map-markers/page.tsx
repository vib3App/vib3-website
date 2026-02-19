'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';

const MARKER_STYLES = [
  { id: 'default', label: 'Default Pin', preview: 'Standard map pin marker' },
  { id: 'circle', label: 'Circle', preview: 'Circular avatar marker' },
  { id: 'pulse', label: 'Pulse', preview: 'Animated pulsing marker' },
  { id: 'neon', label: 'Neon Glow', preview: 'Glowing neon outline marker' },
  { id: 'minimal', label: 'Minimal', preview: 'Small dot with label' },
  { id: 'bubble', label: 'Bubble', preview: 'Speech bubble style marker' },
];

const MARKER_COLORS = [
  { id: 'purple', color: '#a855f7', label: 'Purple' },
  { id: 'teal', color: '#14b8a6', label: 'Teal' },
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'green', color: '#22c55e', label: 'Green' },
  { id: 'orange', color: '#f97316', label: 'Orange' },
  { id: 'pink', color: '#ec4899', label: 'Pink' },
  { id: 'red', color: '#ef4444', label: 'Red' },
  { id: 'white', color: '#ffffff', label: 'White' },
];

const STORAGE_KEY = 'vib3-map-markers';

interface MapMarkerConfig {
  style: string;
  color: string;
  showLabel: boolean;
  showAvatar: boolean;
  clusterNearby: boolean;
}

const DEFAULT_CONFIG: MapMarkerConfig = {
  style: 'default',
  color: 'purple',
  showLabel: true,
  showAvatar: true,
  clusterNearby: true,
};

export default function MapMarkersPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [config, setConfig] = useState<MapMarkerConfig>(DEFAULT_CONFIG);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
    } catch { /* ignore */ }
  }, []);

  const updateConfig = (updates: Partial<MapMarkerConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!isAuthVerified) return null;
  if (!isAuthenticated) { router.push('/login?redirect=/settings/map-markers'); return null; }

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
            <h1 className="text-xl font-bold text-white">Map Markers</h1>
            {saved && <span className="text-green-400 text-sm ml-auto">Saved!</span>}
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-6">
          {/* Marker Style */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Marker Style</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              {MARKER_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => updateConfig({ style: style.id })}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                >
                  <div>
                    <span className="text-white text-sm">{style.label}</span>
                    <span className="text-white/40 text-xs block">{style.preview}</span>
                  </div>
                  {config.style === style.id && (
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Marker Color */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Marker Color</h3>
            <div className="glass-card rounded-2xl p-4">
              <div className="grid grid-cols-4 gap-3">
                {MARKER_COLORS.map((mc) => (
                  <button
                    key={mc.id}
                    onClick={() => updateConfig({ color: mc.id })}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition ${
                      config.color === mc.id ? 'bg-white/10 ring-2 ring-white/30' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-white/20" style={{ backgroundColor: mc.color }} />
                    <span className="text-white/60 text-xs">{mc.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Toggles */}
          <section>
            <h3 className="text-white/50 text-sm font-medium mb-3">Display Options</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
              <ToggleRow label="Show Labels" desc="Display username near markers" enabled={config.showLabel} onToggle={() => updateConfig({ showLabel: !config.showLabel })} />
              <ToggleRow label="Show Avatars" desc="Display profile pictures on markers" enabled={config.showAvatar} onToggle={() => updateConfig({ showAvatar: !config.showAvatar })} />
              <ToggleRow label="Cluster Nearby" desc="Group markers that are close together" enabled={config.clusterNearby} onToggle={() => updateConfig({ clusterNearby: !config.clusterNearby })} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ToggleRow({ label, desc, enabled, onToggle }: { label: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <span className="text-white text-sm block">{label}</span>
        <span className="text-white/40 text-xs">{desc}</span>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-7 rounded-full relative transition-colors ${enabled ? 'bg-purple-500' : 'bg-white/20'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${enabled ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  );
}
