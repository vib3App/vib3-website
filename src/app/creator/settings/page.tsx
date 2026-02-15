'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { creatorSettingsApi } from '@/services/api';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

function Toggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${
        enabled ? 'bg-purple-500' : 'bg-white/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-200 pointer-events-none ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  );
}

interface CreatorSettings {
  tipsEnabled: boolean;
  tipsMinimum: number;
  subscriptionsEnabled: boolean;
  giftingEnabled: boolean;
  notifyOnGift: boolean;
  notifyOnSubscription: boolean;
  notifyOnTip: boolean;
}

const defaultSettings: CreatorSettings = {
  tipsEnabled: true,
  tipsMinimum: 100,
  subscriptionsEnabled: false,
  giftingEnabled: true,
  notifyOnGift: true,
  notifyOnSubscription: true,
  notifyOnTip: true,
};

const STORAGE_KEY = 'vib3_creator_settings';

/** Read cached settings from localStorage (best-effort). */
function readLocalCache(): CreatorSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    // Corrupted cache -- ignore
  }
  return null;
}

/** Write settings to localStorage cache. */
function writeLocalCache(settings: CreatorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or unavailable -- ignore
  }
}

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<CreatorSettings>(defaultSettings);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/settings');
      return;
    }

    let cancelled = false;

    const load = async () => {
      // Show cached settings immediately while fetching from backend
      const cached = readLocalCache();
      if (cached && !cancelled) {
        setSettings(cached);
      }

      try {
        const apiSettings = await creatorSettingsApi.getSettings();
        if (!cancelled) {
          // Map API shape into local shape, preserving notification prefs from cache
          const merged: CreatorSettings = {
            tipsEnabled: apiSettings.tipsEnabled,
            tipsMinimum: apiSettings.minimumPayout,
            subscriptionsEnabled: apiSettings.subscriptionsEnabled,
            giftingEnabled: apiSettings.giftsEnabled,
            // Notification prefs are not in the monetization API -- keep from cache/defaults
            notifyOnGift: cached?.notifyOnGift ?? defaultSettings.notifyOnGift,
            notifyOnSubscription: cached?.notifyOnSubscription ?? defaultSettings.notifyOnSubscription,
            notifyOnTip: cached?.notifyOnTip ?? defaultSettings.notifyOnTip,
          };
          setSettings(merged);
          writeLocalCache(merged);
        }
      } catch (err) {
        logger.error('Failed to load creator settings from API:', err);
        // Already showing cached or defaults -- just continue
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isAuthenticated, isAuthVerified, router]);

  const persistSettings = useCallback(async (newSettings: CreatorSettings) => {
    // Optimistically update state and cache
    setSettings(newSettings);
    writeLocalCache(newSettings);

    setIsSaving(true);
    try {
      await creatorSettingsApi.updateSettings({
        tipsEnabled: newSettings.tipsEnabled,
        giftsEnabled: newSettings.giftingEnabled,
        subscriptionsEnabled: newSettings.subscriptionsEnabled,
        minimumPayout: newSettings.tipsMinimum,
      });
    } catch (err) {
      logger.error('Failed to save creator settings:', err);
      addToast('Failed to save settings. Changes saved locally.');
    } finally {
      setIsSaving(false);
    }
  }, [addToast]);

  const toggleSetting = useCallback((key: keyof CreatorSettings) => {
    setSettings(prev => {
      const current = prev[key];
      if (typeof current !== 'boolean') return prev;
      const newSettings = { ...prev, [key]: !current };
      // Notification prefs are local-only (no API endpoint), just cache them
      const isNotificationKey = key === 'notifyOnGift' || key === 'notifyOnSubscription' || key === 'notifyOnTip';
      if (isNotificationKey) {
        writeLocalCache(newSettings);
      } else {
        persistSettings(newSettings);
      }
      return newSettings;
    });
  }, [persistSettings]);

  const updateMinimum = useCallback((value: number) => {
    setSettings(prev => {
      const newSettings = { ...prev, tipsMinimum: value };
      persistSettings(newSettings);
      return newSettings;
    });
  }, [persistSettings]);

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-20 md:pt-16 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-white/70 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Creator Settings</h1>
          {isSaving && (
            <div className="ml-auto w-5 h-5 border-2 border-white/30 border-t-purple-500 rounded-full animate-spin" />
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tips Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Tips</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Enable Tips</div>
                    <div className="text-sm text-white/50">Allow fans to send you one-time tips</div>
                  </div>
                  <Toggle enabled={settings.tipsEnabled} onToggle={() => toggleSetting('tipsEnabled')} disabled={isSaving} />
                </div>

                {settings.tipsEnabled && (
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Minimum Tip Amount (coins)</label>
                    <input
                      type="number"
                      value={settings.tipsMinimum}
                      onChange={(e) => updateMinimum(parseInt(e.target.value) || 0)}
                      min="1"
                      disabled={isSaving}
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 disabled:opacity-50"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Subscriptions Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Subscriptions</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Enable Subscriptions</div>
                  <div className="text-sm text-white/50">Allow fans to subscribe for exclusive content</div>
                </div>
                <Toggle enabled={settings.subscriptionsEnabled} onToggle={() => toggleSetting('subscriptionsEnabled')} disabled={isSaving} />
              </div>
            </div>

            {/* Gifts Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Gifts</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Enable Gifts</div>
                  <div className="text-sm text-white/50">Receive virtual gifts during videos and lives</div>
                </div>
                <Toggle enabled={settings.giftingEnabled} onToggle={() => toggleSetting('giftingEnabled')} disabled={isSaving} />
              </div>
            </div>

            {/* Notifications Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
              <p className="text-white/40 text-xs mb-4">Notification preferences are stored locally on this device.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on gift received</div>
                  <Toggle enabled={settings.notifyOnGift} onToggle={() => toggleSetting('notifyOnGift')} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on new subscriber</div>
                  <Toggle enabled={settings.notifyOnSubscription} onToggle={() => toggleSetting('notifyOnSubscription')} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on tip received</div>
                  <Toggle enabled={settings.notifyOnTip} onToggle={() => toggleSetting('notifyOnTip')} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
