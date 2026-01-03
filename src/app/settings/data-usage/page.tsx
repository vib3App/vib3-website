'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

type VideoQuality = 'Auto' | 'High (1080p)' | 'Medium (720p)' | 'Low (480p)';

interface DataUsageSettings {
  videoQuality: VideoQuality;
  downloadOverWifi: boolean;
  uploadOverWifi: boolean;
  dataSaver: boolean;
}

const VIDEO_QUALITY_OPTIONS: VideoQuality[] = [
  'Auto',
  'High (1080p)',
  'Medium (720p)',
  'Low (480p)',
];

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-purple-400 mb-3 mt-6 first:mt-0">
      {children}
    </h3>
  );
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
    <div className="flex items-center justify-between py-3">
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

function RadioOption({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-3 py-3 w-full text-left"
    >
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-purple-500' : 'border-white/30'
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
      </div>
      <span className="text-white">{label}</span>
    </button>
  );
}

export default function DataUsageSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<DataUsageSettings>({
    videoQuality: 'Auto',
    downloadOverWifi: true,
    uploadOverWifi: true,
    dataSaver: false,
  });

  // Load settings
  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/settings/data-usage');
      return;
    }

    // Load from localStorage
    try {
      const saved = localStorage.getItem('vib3_data_usage_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
    setIsLoading(false);
  }, [isAuthenticated, isAuthVerified, router]);

  // Save settings whenever they change
  const updateSettings = (updates: Partial<DataUsageSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem('vib3_data_usage_settings', JSON.stringify(newSettings));
  };

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold text-white">Data Usage</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6">
              {/* Cellular Data Section */}
              <SectionHeader>Cellular Data</SectionHeader>
              <ToggleSwitch
                label="Data Saver"
                description="Reduce data usage on cellular networks"
                checked={settings.dataSaver}
                onChange={(checked) => updateSettings({ dataSaver: checked })}
              />

              {/* Video Quality Section */}
              <SectionHeader>Video Quality</SectionHeader>
              <div className="space-y-1">
                {VIDEO_QUALITY_OPTIONS.map((quality) => (
                  <RadioOption
                    key={quality}
                    label={quality}
                    selected={settings.videoQuality === quality}
                    onSelect={() => updateSettings({ videoQuality: quality })}
                  />
                ))}
              </div>

              {/* Downloads Section */}
              <SectionHeader>Downloads</SectionHeader>
              <ToggleSwitch
                label="Download over WiFi only"
                checked={settings.downloadOverWifi}
                onChange={(checked) => updateSettings({ downloadOverWifi: checked })}
              />
              <ToggleSwitch
                label="Upload over WiFi only"
                checked={settings.uploadOverWifi}
                onChange={(checked) => updateSettings({ uploadOverWifi: checked })}
              />

              {/* Data saver note */}
              {settings.dataSaver && (
                <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-white/70 text-sm">
                    Data Saver is enabled. Videos will load at lower quality on cellular
                    networks to save data.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
