'use client';

import { useState, useEffect } from 'react';
import { SettingsCard, SettingsToggle } from './SettingsComponents';
import { notificationsApi } from '@/services/api';
import type { NotificationSettings } from '@/types/notification';

const defaultSettings: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: false,
  likes: true,
  comments: true,
  follows: true,
  mentions: true,
  messages: true,
  liveStreams: true,
  systemUpdates: true,
};

export function NotificationsSection() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getSettings()
      .then(setSettings)
      .catch(() => {/* Use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key: keyof NotificationSettings) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);

    try {
      await notificationsApi.updateSettings({ [key]: newValue });
    } catch {
      // Revert on error
      setSettings(settings);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass-card rounded-2xl p-4 animate-pulse">
          <div className="h-16 bg-white/5 rounded mb-2" />
          <div className="h-16 bg-white/5 rounded mb-2" />
          <div className="h-16 bg-white/5 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsToggle
          label="Push Notifications"
          description="Get notified on your device"
          enabled={settings.pushEnabled}
          onChange={() => updateSetting('pushEnabled')}
        />
        <SettingsToggle
          label="New Followers"
          description="When someone follows you"
          enabled={settings.follows}
          onChange={() => updateSetting('follows')}
        />
        <SettingsToggle
          label="Likes"
          description="When someone likes your video"
          enabled={settings.likes}
          onChange={() => updateSetting('likes')}
        />
        <SettingsToggle
          label="Comments"
          description="When someone comments on your video"
          enabled={settings.comments}
          onChange={() => updateSetting('comments')}
        />
        <SettingsToggle
          label="Mentions"
          description="When someone mentions you"
          enabled={settings.mentions}
          onChange={() => updateSetting('mentions')}
        />
        <SettingsToggle
          label="Direct Messages"
          description="When you receive a message"
          enabled={settings.messages}
          onChange={() => updateSetting('messages')}
        />
        <SettingsToggle
          label="Live Streams"
          description="When followed creators go live"
          enabled={settings.liveStreams}
          onChange={() => updateSetting('liveStreams')}
        />
      </SettingsCard>
      <SettingsCard>
        <SettingsToggle
          label="Email Notifications"
          description="Weekly digest and updates"
          enabled={settings.emailEnabled}
          onChange={() => updateSetting('emailEnabled')}
        />
      </SettingsCard>
    </div>
  );
}
