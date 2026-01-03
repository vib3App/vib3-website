'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { useAuthStore } from '@/stores/authStore';

interface CreatorSettings {
  tipsEnabled: boolean;
  tipsMinimum: number;
  subscriptionsEnabled: boolean;
  giftsEnabled: boolean;
  notifyOnGift: boolean;
  notifyOnSubscription: boolean;
  notifyOnTip: boolean;
}

export default function CreatorSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<CreatorSettings>({
    tipsEnabled: true,
    tipsMinimum: 100,
    subscriptionsEnabled: false,
    giftsEnabled: true,
    notifyOnGift: true,
    notifyOnSubscription: true,
    notifyOnTip: true,
  });

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/creator/settings');
      return;
    }
    // Simulate loading settings
    setTimeout(() => setIsLoading(false), 500);
  }, [isAuthenticated, isAuthVerified, router]);

  const handleToggle = (key: keyof CreatorSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Save to API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
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
                      value={settings.tipsMinimum}
                      onChange={(e) => setSettings((prev) => ({ ...prev, tipsMinimum: parseInt(e.target.value) || 0 }))}
                      min="1"
                      className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                )}
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
                  onClick={() => handleToggle('giftsEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.giftsEnabled ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.giftsEnabled ? 'translate-x-6' : 'translate-x-0.5'
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
                    onClick={() => handleToggle('notifyOnGift')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifyOnGift ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.notifyOnGift ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on new subscriber</div>
                  <button
                    onClick={() => handleToggle('notifyOnSubscription')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifyOnSubscription ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.notifyOnSubscription ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-white">Notify on tip received</div>
                  <button
                    onClick={() => handleToggle('notifyOnTip')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifyOnTip ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        settings.notifyOnTip ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
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
