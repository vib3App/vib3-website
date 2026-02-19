'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsCard, SettingsToggle, SettingsLink } from './SettingsComponents';
import { CallPermissions } from '@/components/call/CallPermissions';

type CallPermission = 'everyone' | 'followers' | 'mutual' | 'nobody';

interface PrivacySettings {
  privateAccount: boolean;
  allowComments: boolean;
  allowMessages: boolean;
  allowDuets: boolean;
  callPermission: CallPermission;
}

const defaultSettings: PrivacySettings = {
  privateAccount: false,
  allowComments: true,
  allowMessages: true,
  allowDuets: true,
  callPermission: 'everyone',
};

const STORAGE_KEY = 'vib3_privacy_settings';

export function PrivacySection() {
  const router = useRouter();
  const [settings, setSettings] = useState<PrivacySettings>(() => {
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
      <SettingsCard>
        <CallPermissions
          currentPermission={settings.callPermission}
          onPermissionChange={(perm) => {
            const newSettings = { ...settings, callPermission: perm };
            setSettings(newSettings);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
          }}
          blockedUsers={[]}
          onUnblockUser={() => {}}
        />
      </SettingsCard>
    </div>
  );
}
