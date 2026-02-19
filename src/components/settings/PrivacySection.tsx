'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsCard, SettingsToggle, SettingsLink } from './SettingsComponents';
import { CallPermissions } from '@/components/call/CallPermissions';
import { callsApi } from '@/services/api/calls';
import { logger } from '@/utils/logger';

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

  // GAP-13: Load call privacy from server on mount
  useEffect(() => {
    callsApi.getCallPrivacy().then(({ permission }) => {
      if (permission && permission !== settings.callPermission) {
        const newSettings = { ...settings, callPermission: permission as CallPermission };
        setSettings(newSettings);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      }
    }).catch(err => logger.error('Failed to load call privacy:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <SettingsCard>
        <CallPermissions
          currentPermission={settings.callPermission}
          onPermissionChange={(perm) => {
            const newSettings = { ...settings, callPermission: perm };
            setSettings(newSettings);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
            // GAP-13: Persist to server
            callsApi.updateCallPrivacy(perm).catch(err =>
              logger.error('Failed to update call privacy:', err)
            );
          }}
          blockedUsers={[]}
          onUnblockUser={() => {}}
        />
      </SettingsCard>
    </div>
  );
}
