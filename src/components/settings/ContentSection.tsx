'use client';

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

export function ContentSection() {
  return (
    <div className="space-y-4">
      <SettingsSectionTitle title="Playback" />
      <SettingsCard>
        <SettingsToggle label="Autoplay Videos" description="Play videos automatically in feed" enabled={true} />
        <SettingsSelect label="Default Quality" description="Video playback quality" value="auto" options={qualityOptions} />
        <SettingsToggle label="Loop Videos" description="Repeat videos when finished" enabled={true} />
        <SettingsToggle label="Mute by Default" description="Start videos muted" enabled={false} />
      </SettingsCard>

      <SettingsSectionTitle title="AI Features" />
      <SettingsCard>
        <SettingsToggle label="Auto-Captions" description="Generate captions automatically" enabled={true} />
        <SettingsSelect label="Caption Language" description="Preferred caption language" value="en" options={languageOptions} />
        <SettingsToggle label="Smart Recommendations" description="AI-powered content suggestions" enabled={true} />
        <SettingsToggle label="Beauty Filters" description="AI face enhancement in camera" enabled={true} />
      </SettingsCard>

      <SettingsSectionTitle title="Display" />
      <SettingsCard>
        <SettingsToggle label="Dark Mode" description="Use dark theme" enabled={true} />
        <SettingsToggle label="Reduce Motion" description="Limit animations" enabled={false} />
        <SettingsToggle label="Show View Counts" description="Display view numbers" enabled={true} />
      </SettingsCard>

      <SettingsSectionTitle title="Data & Storage" />
      <SettingsCard>
        <SettingsToggle label="Data Saver" description="Reduce data usage" enabled={false} />
        <SettingsLink label="Clear Cache" rightContent={<span className="text-white/50 text-sm">128 MB</span>} showArrow={false} />
        <SettingsLink label="Clear Watch History" />
      </SettingsCard>
    </div>
  );
}
