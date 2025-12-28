'use client';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange?: () => void;
}

function ToggleSwitch({ enabled }: ToggleSwitchProps) {
  return (
    <button className={`w-12 h-6 rounded-full ${enabled ? 'bg-pink-500' : 'bg-white/20'}`}>
      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function SettingsTab() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Monetization Settings</h2>

        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div>
            <div className="font-medium">Enable Gifts</div>
            <div className="text-sm text-gray-400">Allow viewers to send you gifts</div>
          </div>
          <ToggleSwitch enabled={true} />
        </div>

        <div className="flex items-center justify-between py-4 border-b border-white/10">
          <div>
            <div className="font-medium">Enable Tips</div>
            <div className="text-sm text-gray-400">Allow one-time tips from fans</div>
          </div>
          <ToggleSwitch enabled={false} />
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <div className="font-medium">Enable Subscriptions</div>
            <div className="text-sm text-gray-400">Offer monthly memberships</div>
          </div>
          <ToggleSwitch enabled={false} />
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Payout Settings</h2>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Payout Method</label>
          <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500">
            <option>Stripe</option>
            <option>PayPal</option>
            <option>Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Minimum Payout ($)</label>
          <input
            type="number"
            defaultValue={50}
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
