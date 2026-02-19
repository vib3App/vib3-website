'use client';

import { useState } from 'react';
import { apiClient } from '@/services/api/client';
import { logger } from '@/utils/logger';

interface PlaybackSettings {
  autoplay: boolean;
  defaultQuality: 'auto' | '1080p' | '720p' | '480p' | '360p';
  loop: boolean;
  mutedByDefault: boolean;
  dataSaver: boolean;
  captionLanguage: string;
}

const defaultSettings: PlaybackSettings = {
  autoplay: true,
  defaultQuality: 'auto',
  loop: false,
  mutedByDefault: false,
  dataSaver: false,
  captionLanguage: 'off',
};

const captionLanguages = [
  { value: 'off', label: 'Off' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
];

const qualityOptions = [
  { value: 'auto', label: 'Auto (Recommended)' },
  { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' },
  { value: '480p', label: '480p' },
  { value: '360p', label: '360p' },
];

export function PlaybackSection() {
  const [settings, setSettings] = useState<PlaybackSettings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    const saved = localStorage.getItem('playback_settings');
    if (saved) {
      try { return JSON.parse(saved) as PlaybackSettings; } catch { /* ignore */ }
    }
    return defaultSettings;
  });

  const updateSetting = <K extends keyof PlaybackSettings>(key: K, value: PlaybackSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('playback_settings', JSON.stringify(updated));
    apiClient.patch('/users/preferences', { playback: updated }).catch(err => {
      logger.error('Failed to sync playback settings:', err);
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-lg">Playback & Data</h2>

      <ToggleSetting
        label="Autoplay Videos"
        description="Automatically play videos in your feed"
        enabled={settings.autoplay}
        onChange={v => updateSetting('autoplay', v)}
      />

      <div className="glass-card rounded-xl p-4">
        <h3 className="text-white font-medium mb-1">Default Quality</h3>
        <p className="text-white/40 text-sm mb-3">Choose default streaming quality</p>
        <div className="grid grid-cols-3 gap-2">
          {qualityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateSetting('defaultQuality', opt.value as PlaybackSettings['defaultQuality'])}
              className={`px-3 py-2 text-sm rounded-lg transition ${
                settings.defaultQuality === opt.value
                  ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                  : 'glass text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ToggleSetting
        label="Loop Videos"
        description="Automatically replay videos when they end"
        enabled={settings.loop}
        onChange={v => updateSetting('loop', v)}
      />

      <ToggleSetting
        label="Muted by Default"
        description="Start videos with sound off"
        enabled={settings.mutedByDefault}
        onChange={v => updateSetting('mutedByDefault', v)}
      />

      <ToggleSetting
        label="Data Saver"
        description="Reduce quality on mobile data to save bandwidth"
        enabled={settings.dataSaver}
        onChange={v => updateSetting('dataSaver', v)}
      />

      {/* Caption Language - Gap #73 */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-white font-medium mb-1">Default Caption Language</h3>
        <p className="text-white/40 text-sm mb-3">Show auto-generated captions in this language</p>
        <div className="grid grid-cols-3 gap-2">
          {captionLanguages.map(opt => (
            <button
              key={opt.value}
              onClick={() => updateSetting('captionLanguage', opt.value)}
              className={`px-3 py-2 text-sm rounded-lg transition ${
                settings.captionLanguage === opt.value
                  ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                  : 'glass text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onChange }: {
  label: string; description: string; enabled: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center justify-between">
      <div>
        <h3 className="text-white font-medium">{label}</h3>
        <p className="text-white/40 text-sm mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-gradient-to-r from-purple-500 to-teal-400' : 'bg-white/20'}`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}
