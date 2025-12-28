'use client';

import { SettingsCard, SettingsLink } from './SettingsComponents';

export function AboutSection() {
  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsLink label="Terms of Service" />
        <SettingsLink label="Privacy Policy" />
        <SettingsLink label="Community Guidelines" />
      </SettingsCard>
      <div className="text-center text-white/30 text-sm py-4">VIB3 v1.0.0</div>
    </div>
  );
}
