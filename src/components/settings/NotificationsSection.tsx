'use client';

import { useEffect, useState } from 'react';
import { SettingsCard, SettingsToggle } from './SettingsComponents';
import { notificationsApi } from '@/services/api';
import type { NotificationSettings, DoNotDisturbSettings } from '@/types/notification';
import { logger } from '@/utils/logger';

const defaultSettings: NotificationSettings = {
  pushEnabled: true,
  emailNotifications: false,
  likes: true,
  comments: true,
  follows: true,
  mentions: true,
  directMessages: true,
  liveStreams: true,
  videoUploads: true,
  milestones: true,
  echoes: true,
  bounces: true,
  doNotDisturb: { enabled: false, startTime: '22:00', endTime: '08:00' },
};

type ToggleKey = Exclude<keyof NotificationSettings, 'doNotDisturb'>;

const PUSH_TOGGLES: { key: ToggleKey; label: string; description: string }[] = [
  { key: 'follows', label: 'New Followers', description: 'When someone follows you' },
  { key: 'likes', label: 'Likes', description: 'When someone likes your video' },
  { key: 'comments', label: 'Comments', description: 'When someone comments on your video' },
  { key: 'mentions', label: 'Mentions', description: 'When someone mentions you' },
  { key: 'directMessages', label: 'Direct Messages', description: 'When you receive a message' },
  { key: 'liveStreams', label: 'Live Streams', description: 'When followed creators go live' },
  { key: 'videoUploads', label: 'New Videos', description: 'When followed creators post a new video' },
  { key: 'milestones', label: 'Milestones', description: 'Follower counts, achievements, badges' },
  { key: 'echoes', label: 'Echo Responses', description: 'When someone records an echo of your video' },
  { key: 'bounces', label: 'Bounces', description: 'When someone bounces off your video' },
];

export function NotificationsSection() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await notificationsApi.getSettings();
        if (cancelled) return;
        setSettings({
          ...defaultSettings,
          ...data,
          doNotDisturb: { ...defaultSettings.doNotDisturb, ...(data.doNotDisturb ?? {}) },
        });
      } catch {
        // Defaults are fine for unauthenticated render.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const updateToggle = async (key: ToggleKey) => {
    const previous = settings[key];
    const nextValue = !previous;
    setSettings(s => ({ ...s, [key]: nextValue }));
    try {
      await notificationsApi.updateSettings({ [key]: nextValue });
    } catch (err) {
      logger.error(`Failed to update notification toggle ${key}:`, err);
      setSettings(s => ({ ...s, [key]: previous }));
    }
  };

  const updateDnd = async (patch: Partial<DoNotDisturbSettings>) => {
    const previous = settings.doNotDisturb;
    const next = { ...previous, ...patch };
    setSettings(s => ({ ...s, doNotDisturb: next }));
    try {
      await notificationsApi.updateSettings({ doNotDisturb: next });
    } catch (err) {
      logger.error('Failed to update DND:', err);
      setSettings(s => ({ ...s, doNotDisturb: previous }));
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
          onChange={() => updateToggle('pushEnabled')}
        />
      </SettingsCard>

      <SettingsCard>
        {PUSH_TOGGLES.map(t => (
          <SettingsToggle
            key={t.key}
            label={t.label}
            description={t.description}
            enabled={settings[t.key]}
            onChange={() => updateToggle(t.key)}
          />
        ))}
      </SettingsCard>

      <SettingsCard>
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Do Not Disturb</div>
              <div className="text-xs text-white/50">Silence notifications during quiet hours</div>
            </div>
            <button
              type="button"
              onClick={() => updateDnd({ enabled: !settings.doNotDisturb.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.doNotDisturb.enabled ? 'bg-purple-500' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={settings.doNotDisturb.enabled}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  settings.doNotDisturb.enabled ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-3 px-4 py-3 transition ${settings.doNotDisturb.enabled ? '' : 'opacity-50'}`}>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/60">Start</span>
            <input
              type="time"
              value={settings.doNotDisturb.startTime}
              disabled={!settings.doNotDisturb.enabled}
              onChange={(e) => void updateDnd({ startTime: e.target.value })}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/40 [color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-white/60">End</span>
            <input
              type="time"
              value={settings.doNotDisturb.endTime}
              disabled={!settings.doNotDisturb.enabled}
              onChange={(e) => void updateDnd({ endTime: e.target.value })}
              className="bg-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500/40 [color-scheme:dark]"
            />
          </label>
        </div>
      </SettingsCard>

      <SettingsCard>
        <SettingsToggle
          label="Email Notifications"
          description="Weekly digest and account updates"
          enabled={settings.emailNotifications}
          onChange={() => updateToggle('emailNotifications')}
        />
      </SettingsCard>
    </div>
  );
}
