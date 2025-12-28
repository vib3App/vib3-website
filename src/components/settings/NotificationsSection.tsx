'use client';

import { SettingsCard, SettingsToggle } from './SettingsComponents';

export function NotificationsSection() {
  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsToggle label="Push Notifications" description="Get notified on your device" enabled={true} />
        <SettingsToggle label="New Followers" description="When someone follows you" enabled={true} />
        <SettingsToggle label="Likes" description="When someone likes your video" enabled={true} />
        <SettingsToggle label="Comments" description="When someone comments on your video" enabled={true} />
        <SettingsToggle label="Mentions" description="When someone mentions you" enabled={true} />
        <SettingsToggle label="Direct Messages" description="When you receive a message" enabled={true} />
        <SettingsToggle label="Live Streams" description="When followed creators go live" enabled={true} />
      </SettingsCard>
      <SettingsCard>
        <SettingsToggle label="Email Notifications" description="Weekly digest and updates" enabled={false} />
      </SettingsCard>
    </div>
  );
}
