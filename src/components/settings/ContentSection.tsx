'use client';

import { useState, useEffect } from 'react';
import { SettingsCard, SettingsToggle, SettingsSelect, SettingsSectionTitle, SettingsLink } from './SettingsComponents';

const qualityOptions = [
  { value: 'auto', label: 'Auto' }, { value: '1080p', label: '1080p' },
  { value: '720p', label: '720p' }, { value: '480p', label: '480p' }, { value: '360p', label: '360p' },
];

const languageOptions = [
  { value: 'en', label: 'English' }, { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' }, { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' }, { value: 'ko', label: 'Korean' }, { value: 'zh', label: 'Chinese' },
];

interface ContentSettings {
  autoplay: boolean;
  defaultQuality: string;
  loopVideos: boolean;
  muteByDefault: boolean;
  autoCaptions: boolean;
  captionLanguage: string;
  smartRecommendations: boolean;
  beautyFilters: boolean;
  darkMode: boolean;
  reduceMotion: boolean;
  showViewCounts: boolean;
  dataSaver: boolean;
}

const defaultSettings: ContentSettings = {
  autoplay: true,
  defaultQuality: 'auto',
  loopVideos: true,
  muteByDefault: false,
  autoCaptions: true,
  captionLanguage: 'en',
  smartRecommendations: true,
  beautyFilters: true,
  darkMode: true,
  reduceMotion: false,
  showViewCounts: true,
  dataSaver: false,
};

const STORAGE_KEY = 'vib3_content_settings';

export function ContentSection() {
  const [settings, setSettings] = useState<ContentSettings>(() => {
    // Load settings from localStorage during initialization
    if (typeof window === 'undefined') return defaultSettings;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...defaultSettings, ...JSON.parse(stored) };
      } catch {
        // Use defaults if parse fails
      }
    }
    return defaultSettings;
  });
  const [cacheSize, setCacheSize] = useState('0 MB');

  useEffect(() => {
    // Estimate cache size from storage usage
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(({ usage }) => {
        if (usage) {
          const mb = (usage / (1024 * 1024)).toFixed(0);
          setCacheSize(`${mb} MB`);
        }
      });
    }
  }, []);

  const updateSetting = <K extends keyof ContentSettings>(key: K, value: ContentSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  const toggleSetting = (key: keyof ContentSettings) => {
    const current = settings[key];
    if (typeof current === 'boolean') {
      updateSetting(key, !current);
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      setCacheSize('0 MB');
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('vib3_watch_history');
  };

  return (
    <div className="space-y-4">
      <SettingsSectionTitle title="Playback" />
      <SettingsCard>
        <SettingsToggle
          label="Autoplay Videos"
          description="Play videos automatically in feed"
          enabled={settings.autoplay}
          onChange={() => toggleSetting('autoplay')}
        />
        <SettingsSelect
          label="Default Quality"
          description="Video playback quality"
          value={settings.defaultQuality}
          options={qualityOptions}
          onChange={(v) => updateSetting('defaultQuality', v)}
        />
        <SettingsToggle
          label="Loop Videos"
          description="Repeat videos when finished"
          enabled={settings.loopVideos}
          onChange={() => toggleSetting('loopVideos')}
        />
        <SettingsToggle
          label="Mute by Default"
          description="Start videos muted"
          enabled={settings.muteByDefault}
          onChange={() => toggleSetting('muteByDefault')}
        />
      </SettingsCard>

      <SettingsSectionTitle title="AI Features" />
      <SettingsCard>
        <SettingsToggle
          label="Auto-Captions"
          description="Generate captions automatically"
          enabled={settings.autoCaptions}
          onChange={() => toggleSetting('autoCaptions')}
        />
        <SettingsSelect
          label="Caption Language"
          description="Preferred caption language"
          value={settings.captionLanguage}
          options={languageOptions}
          onChange={(v) => updateSetting('captionLanguage', v)}
        />
        <SettingsToggle
          label="Smart Recommendations"
          description="AI-powered content suggestions"
          enabled={settings.smartRecommendations}
          onChange={() => toggleSetting('smartRecommendations')}
        />
        <SettingsToggle
          label="Beauty Filters"
          description="AI face enhancement in camera"
          enabled={settings.beautyFilters}
          onChange={() => toggleSetting('beautyFilters')}
        />
      </SettingsCard>

      <SettingsSectionTitle title="Display" />
      <SettingsCard>
        <SettingsToggle
          label="Dark Mode"
          description="Use dark theme"
          enabled={settings.darkMode}
          onChange={() => toggleSetting('darkMode')}
        />
        <SettingsToggle
          label="Reduce Motion"
          description="Limit animations"
          enabled={settings.reduceMotion}
          onChange={() => toggleSetting('reduceMotion')}
        />
        <SettingsToggle
          label="Show View Counts"
          description="Display view numbers"
          enabled={settings.showViewCounts}
          onChange={() => toggleSetting('showViewCounts')}
        />
      </SettingsCard>

      <SettingsSectionTitle title="Data & Storage" />
      <SettingsCard>
        <SettingsToggle
          label="Data Saver"
          description="Reduce data usage"
          enabled={settings.dataSaver}
          onChange={() => toggleSetting('dataSaver')}
        />
        <SettingsLink
          label="Clear Cache"
          rightContent={<span className="text-white/50 text-sm">{cacheSize}</span>}
          showArrow={false}
          onClick={handleClearCache}
        />
        <SettingsLink label="Clear Watch History" onClick={handleClearHistory} />
      </SettingsCard>
    </div>
  );
}
