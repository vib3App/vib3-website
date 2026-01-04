'use client';

import { useState, useEffect } from 'react';
import { creatorSettingsApi, type CreatorMonetizationSettings, type StripeConnectStatus } from '@/services/api';

const defaultSettings: CreatorMonetizationSettings = {
  giftsEnabled: true,
  tipsEnabled: false,
  subscriptionsEnabled: false,
  payoutMethod: 'stripe',
  minimumPayout: 50,
};

function Toggle({ enabled, onToggle, disabled }: { enabled: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`w-12 h-7 rounded-full relative transition-colors cursor-pointer ${
        enabled ? 'bg-pink-500' : 'bg-white/20'
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

export function SettingsTab() {
  const [settings, setSettings] = useState<CreatorMonetizationSettings>(defaultSettings);
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [settingsData, stripeData] = await Promise.all([
        creatorSettingsApi.getSettings(),
        creatorSettingsApi.getStripeStatus(),
      ]);
      setSettings(settingsData);
      setStripeStatus(stripeData);
    } catch (e) {
      console.error('Failed to load settings:', e);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = async (key: keyof CreatorMonetizationSettings) => {
    const current = settings[key];
    if (typeof current !== 'boolean') return;

    const newValue = !current;
    const newSettings = { ...settings, [key]: newValue };

    // Optimistic update
    setSettings(newSettings);
    setSaving(true);

    try {
      await creatorSettingsApi.updateSettings({ [key]: newValue });
      showSaved();
    } catch (e) {
      // Revert on error
      setSettings(settings);
      setError('Failed to save setting');
      console.error('Failed to update setting:', e);
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key: keyof CreatorMonetizationSettings, value: string | number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSaving(true);

    try {
      await creatorSettingsApi.updateSettings({ [key]: value } as Partial<CreatorMonetizationSettings>);
      showSaved();
    } catch (e) {
      setSettings(settings);
      setError('Failed to save setting');
      console.error('Failed to update setting:', e);
    } finally {
      setSaving(false);
    }
  };

  const showSaved = () => {
    setSaved(true);
    setError(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    setError(null);

    try {
      // First ensure we have a Stripe Connect account
      const account = await creatorSettingsApi.createStripeAccount();

      if (account.chargesEnabled && account.payoutsEnabled) {
        // Already fully set up
        setStripeStatus(account);
        showSaved();
        return;
      }

      // Get onboarding link and redirect
      const returnUrl = `${window.location.origin}/creator?stripe=success`;
      const refreshUrl = `${window.location.origin}/creator?stripe=refresh`;
      const onboardingUrl = await creatorSettingsApi.getStripeOnboardingLink(returnUrl, refreshUrl);

      // Redirect to Stripe onboarding
      window.location.href = onboardingUrl;
    } catch (e) {
      console.error('Stripe connect error:', e);
      setError('Failed to connect Stripe. Please try again.');
    } finally {
      setConnectingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/30 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  const isStripeConnected = stripeStatus?.chargesEnabled && stripeStatus?.payoutsEnabled;

  return (
    <div className="max-w-2xl space-y-6">
      {saved && (
        <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Settings saved!
        </div>
      )}

      {error && (
        <div className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Monetization Settings</h2>

        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div>
            <div className="font-medium">Enable Gifts</div>
            <div className="text-sm text-gray-400">Allow viewers to send you gifts during videos and lives</div>
          </div>
          <Toggle enabled={settings.giftsEnabled} onToggle={() => toggleSetting('giftsEnabled')} disabled={saving} />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div>
            <div className="font-medium">Enable Tips</div>
            <div className="text-sm text-gray-400">Allow one-time tips from fans on your profile and videos</div>
          </div>
          <Toggle enabled={settings.tipsEnabled} onToggle={() => toggleSetting('tipsEnabled')} disabled={saving} />
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <div className="font-medium">Enable Subscriptions</div>
            <div className="text-sm text-gray-400">Offer monthly memberships with exclusive content</div>
          </div>
          <Toggle enabled={settings.subscriptionsEnabled} onToggle={() => toggleSetting('subscriptionsEnabled')} disabled={saving} />
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Payout Settings</h2>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Payout Method</label>
          <select
            value={settings.payoutMethod}
            onChange={(e) => updateSetting('payoutMethod', e.target.value)}
            disabled={saving}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 disabled:opacity-50"
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
            disabled={saving}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 disabled:opacity-50"
          />
        </div>

        {isStripeConnected ? (
          <div className="flex items-center gap-3 py-3 px-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <div className="font-medium text-green-400">Stripe Connected</div>
              <div className="text-sm text-green-400/70">You can receive payouts</div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleConnectStripe}
            disabled={connectingStripe}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {connectingStripe ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Stripe Account'
            )}
          </button>
        )}

        {stripeStatus && !isStripeConnected && stripeStatus.accountId && (
          <p className="text-sm text-yellow-400">
            Stripe account created but setup incomplete. Click above to finish onboarding.
          </p>
        )}
      </div>
    </div>
  );
}
