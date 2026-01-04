'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';

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

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<CreatorSettings>(defaultSettings);

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/settings');
      return;
    }

    // Load from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        // Use defaults
      }
    }
    setIsLoading(false);
  }, [isAuthenticated, isAuthVerified, router]);

  const toggleSetting = (key: keyof CreatorSettings) => {
    const current = settings[key];
    if (typeof current === 'boolean') {
      const newSettings = { ...settings, [key]: !current };
      setSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    }
  };

  const updateMinimum = (value: number) => {
    const newSettings = { ...settings, tipsMinimum: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-7 rounded-full relative transition-colors ${
        enabled ? 'bg-purple-500' : 'bg-white/20'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-200 ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  );

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
                  <Toggle enabled={settings.tipsEnabled} onToggle={() => toggleSetting('tipsEnabled')} />
                </div>

                {settings.tipsEnabled && (
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Minimum Tip Amount (coins)</label>
                    <input
                      type="number"
                      value={settings.tipsMinimum}
                      onChange={(e) => updateMinimum(parseInt(e.target.value) || 0)}
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
                <Toggle enabled={settings.subscriptionsEnabled} onToggle={() => toggleSetting('subscriptionsEnabled')} />
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
                <Toggle enabled={settings.giftingEnabled} onToggle={() => toggleSetting('giftingEnabled')} />
              </div>
            </div>

            {/* Notifications Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
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
