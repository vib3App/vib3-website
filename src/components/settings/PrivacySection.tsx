'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsCard, SettingsToggle, SettingsLink } from './SettingsComponents';

interface PrivacySettings {
  privateAccount: boolean;
  allowComments: boolean;
  allowMessages: boolean;
  allowDuets: boolean;
}

const defaultSettings: PrivacySettings = {
  privateAccount: false,
  allowComments: true,
  allowMessages: true,
  allowDuets: true,
};

const STORAGE_KEY = 'vib3_privacy_settings';

export function PrivacySection() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>(defaultSettings);

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  const toggleSetting = (key: keyof PrivacySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsToggle
          label="Private Account"
          description="Only approved followers can see your content"
          enabled={settings.privateAccount}
          onChange={() => toggleSetting('privateAccount')}
        />
        <SettingsToggle
          label="Allow Comments"
          description="Let others comment on your videos"
          enabled={settings.allowComments}
          onChange={() => toggleSetting('allowComments')}
        />
        <SettingsToggle
          label="Allow Messages"
          description="Let others send you direct messages"
          enabled={settings.allowMessages}
          onChange={() => toggleSetting('allowMessages')}
        />
        <SettingsToggle
          label="Allow Duets"
          description="Let others create duets with your videos"
          enabled={settings.allowDuets}
          onChange={() => toggleSetting('allowDuets')}
        />
      </SettingsCard>
      <SettingsCard>
        <SettingsLink
          label="Blocked Accounts"
          onClick={() => router.push('/settings/blocked')}
        />
        <SettingsLink
          label="Download Your Data"
          onClick={() => router.push('/settings/download-data')}
        />
      </SettingsCard>
    </div>
  );
}
