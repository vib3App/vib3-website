'use client';

import { SettingsCard, SettingsToggle, SettingsLink } from './SettingsComponents';

export function PrivacySection() {
  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsToggle label="Private Account" enabled={false} />
        <SettingsToggle label="Allow Comments" enabled={true} />
        <SettingsToggle label="Allow Messages" enabled={true} />
        <SettingsToggle label="Allow Duets" enabled={true} />
      </SettingsCard>
      <SettingsCard>
        <SettingsLink label="Blocked Accounts" />
        <SettingsLink label="Download Your Data" />
      </SettingsCard>
    </div>
  );
}
