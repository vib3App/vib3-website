'use client';

import { useState, useEffect } from 'react';

interface CreatorSettings {
  giftsEnabled: boolean;
  tipsEnabled: boolean;
  subscriptionsEnabled: boolean;
  payoutMethod: string;
  minimumPayout: number;
}

const defaultSettings: CreatorSettings = {
  giftsEnabled: true,
  tipsEnabled: false,
  subscriptionsEnabled: false,
  payoutMethod: 'stripe',
  minimumPayout: 50,
};

const STORAGE_KEY = 'vib3_creator_settings';

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${
        enabled ? 'bg-pink-500' : 'bg-white/20'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all duration-200 pointer-events-none ${
          enabled ? 'right-1' : 'left-1'
        }`}
      />
    </button>
  );
}

export function SettingsTab() {
  const [settings, setSettings] = useState<CreatorSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        // Use defaults
      }
    }
  }, []);

  const toggleSetting = (key: keyof CreatorSettings) => {
    const current = settings[key];
    if (typeof current === 'boolean') {
      const newSettings = { ...settings, [key]: !current };
      setSettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      showSaved();
    }
  };

  const updateSetting = (key: keyof CreatorSettings, value: string | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Settings saved!
        </div>
      )}

      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Monetization Settings</h2>

        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div>
            <div className="font-medium">Enable Gifts</div>
            <div className="text-sm text-gray-400">Allow viewers to send you gifts</div>
          </div>
          <Toggle enabled={settings.giftsEnabled} onToggle={() => toggleSetting('giftsEnabled')} />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div>
            <div className="font-medium">Enable Tips</div>
            <div className="text-sm text-gray-400">Allow one-time tips from fans</div>
          </div>
          <Toggle enabled={settings.tipsEnabled} onToggle={() => toggleSetting('tipsEnabled')} />
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <div className="font-medium">Enable Subscriptions</div>
            <div className="text-sm text-gray-400">Offer monthly memberships</div>
          </div>
          <Toggle enabled={settings.subscriptionsEnabled} onToggle={() => toggleSetting('subscriptionsEnabled')} />
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Payout Settings</h2>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Payout Method</label>
          <select
            value={settings.payoutMethod}
            onChange={(e) => updateSetting('payoutMethod', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
          >
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Minimum Payout ($)</label>
          <input
            type="number"
            value={settings.minimumPayout}
            onChange={(e) => updateSetting('minimumPayout', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition">
          Connect Stripe Account
        </button>
      </div>
    </div>
  );
}
