'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';
import { creatorApi } from '@/services/api/creator';
import type { CreatorSettings } from '@/types/creator';

interface LocalSettings {
  tipsMinimum: number;
  notifyOnGift: boolean;
  notifyOnSubscription: boolean;
  notifyOnTip: boolean;
}

const defaultLocalSettings: LocalSettings = {
  tipsMinimum: 100,
  notifyOnGift: true,
  notifyOnSubscription: true,
  notifyOnTip: true,
};

const LOCAL_STORAGE_KEY = 'vib3_creator_local_settings';

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // API-backed settings
  const [settings, setSettings] = useState<Partial<CreatorSettings>>({
    tipsEnabled: true,
    subscriptionsEnabled: false,
    giftingEnabled: true,
  });

  // Local settings (not in API)
  const [localSettings, setLocalSettings] = useState<LocalSettings>(defaultLocalSettings);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/settings');
      return;
    }
    loadSettings();
  }, [isAuthenticated, isAuthVerified, router]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load API settings
      const apiSettings = await creatorApi.getCreatorSettings();
      setSettings(apiSettings);

      // Load local settings from localStorage
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        try {
          setLocalSettings({ ...defaultLocalSettings, ...JSON.parse(stored) });
        } catch {
          // Use defaults
        }
      }
    } catch (err) {
      console.error('Failed to load creator settings:', err);
      // Use defaults if API fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: keyof CreatorSettings) => {
    const newValue = !settings[key];
    const oldSettings = { ...settings };

    // Optimistic update
    setSettings((prev) => ({ ...prev, [key]: newValue }));

    try {
      await creatorApi.updateCreatorSettings({ [key]: newValue });
    } catch (err) {
      // Revert on error
      setSettings(oldSettings);
      setError('Failed to update setting');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleLocalToggle = (key: keyof LocalSettings) => {
    const newSettings = { ...localSettings, [key]: !localSettings[key] };
    setLocalSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleMinimumChange = (value: number) => {
    const newSettings = { ...localSettings, tipsMinimum: value };
    setLocalSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSettings));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await creatorApi.updateCreatorSettings({
        tipsEnabled: settings.tipsEnabled,
        subscriptionsEnabled: settings.subscriptionsEnabled,
        giftingEnabled: settings.giftingEnabled,
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSettings));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
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
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 text-sm">
            Settings saved successfully!
          </div>
        )}

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
                  <button
                    onClick={() => handleToggle('tipsEnabled')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.tipsEnabled ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.tipsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                {settings.tipsEnabled && (
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Minimum Tip Amount (coins)</label>
                    <input
                      type="number"
                      value={localSettings.tipsMinimum}
                      onChange={(e) => handleMinimumChange(parseInt(e.target.value) || 0)}
                      min="1"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
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
                <button
                  onClick={() => handleToggle('subscriptionsEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.subscriptionsEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.subscriptionsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
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
                <button
                  onClick={() => handleToggle('giftingEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.giftingEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.giftingEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on gift received</div>
                  <button
                    onClick={() => handleLocalToggle('notifyOnGift')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      localSettings.notifyOnGift ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.notifyOnGift ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on new subscriber</div>
                  <button
                    onClick={() => handleLocalToggle('notifyOnSubscription')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      localSettings.notifyOnSubscription ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.notifyOnSubscription ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on tip received</div>
                  <button
                    onClick={() => handleLocalToggle('notifyOnTip')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      localSettings.notifyOnTip ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        localSettings.notifyOnTip ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
