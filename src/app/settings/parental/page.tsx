'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';

interface ParentalSettings {
  restrictedMode: boolean;
  screenTimeLimit: number | null; // minutes per day, null = unlimited
  ageRestriction: 'all' | '13+' | '16+' | '18+';
  hideMatureContent: boolean;
  disableComments: boolean;
  disableDMs: boolean;
  requirePINForSettings: boolean;
  pin?: string;
}

const DEFAULT_SETTINGS: ParentalSettings = {
  restrictedMode: false,
  screenTimeLimit: null,
  ageRestriction: 'all',
  hideMatureContent: false,
  disableComments: false,
  disableDMs: false,
  requirePINForSettings: false,
};

export default function ParentalControlsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ParentalSettings>(DEFAULT_SETTINGS);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('parentalSettings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // ignore
      }
    }
  }, []);

  const updateSetting = <K extends keyof ParentalSettings>(key: K, value: ParentalSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('parentalSettings', JSON.stringify(updated));
  };

  const handleSetPIN = () => {
    if (newPIN.length !== 4 || !/^\d+$/.test(newPIN)) {
      setPinError('PIN must be 4 digits');
      return;
    }
    if (newPIN !== confirmPIN) {
      setPinError('PINs do not match');
      return;
    }
    updateSetting('pin', newPIN);
    updateSetting('requirePINForSettings', true);
    setShowPINSetup(false);
    setNewPIN('');
    setConfirmPIN('');
    setPinError('');
  };

  const handleRemovePIN = () => {
    updateSetting('pin', undefined);
    updateSetting('requirePINForSettings', false);
  };

  return (
    <div className="min-h-screen aurora-bg pb-20">
      <TopNav />

      <div className="px-4 pt-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-white">Parental Controls</h1>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <h3 className="text-white font-medium mb-1">Family Safety</h3>
              <p className="text-white/60 text-sm">
                Control what content is accessible and set limits for a safer experience.
              </p>
            </div>
          </div>
        </div>

        {/* Restricted Mode */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Restricted Mode</p>
              <p className="text-white/50 text-sm">Hide potentially mature content</p>
            </div>
            <button
              onClick={() => updateSetting('restrictedMode', !settings.restrictedMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.restrictedMode ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.restrictedMode ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Age Restriction */}
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-3">Age Restriction</p>
            <div className="grid grid-cols-4 gap-2">
              {(['all', '13+', '16+', '18+'] as const).map((age) => (
                <button
                  key={age}
                  onClick={() => updateSetting('ageRestriction', age)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.ageRestriction === age
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {age === 'all' ? 'All Ages' : age}
                </button>
              ))}
            </div>
          </div>

          {/* Screen Time */}
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-3">Daily Screen Time Limit</p>
            <div className="grid grid-cols-4 gap-2">
              {[null, 30, 60, 120].map((mins) => (
                <button
                  key={mins ?? 'unlimited'}
                  onClick={() => updateSetting('screenTimeLimit', mins)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.screenTimeLimit === mins
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {mins === null ? 'None' : mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>
          </div>

          {/* Hide Mature Content */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Hide Mature Content</p>
              <p className="text-white/50 text-sm">Filter age-restricted videos</p>
            </div>
            <button
              onClick={() => updateSetting('hideMatureContent', !settings.hideMatureContent)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.hideMatureContent ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.hideMatureContent ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Disable Comments */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Disable Comments</p>
              <p className="text-white/50 text-sm">Hide all comments on videos</p>
            </div>
            <button
              onClick={() => updateSetting('disableComments', !settings.disableComments)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.disableComments ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.disableComments ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Disable DMs */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Disable Direct Messages</p>
              <p className="text-white/50 text-sm">Prevent receiving messages</p>
            </div>
            <button
              onClick={() => updateSetting('disableDMs', !settings.disableDMs)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.disableDMs ? 'bg-purple-500' : 'bg-white/20'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.disableDMs ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* PIN Protection */}
          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-medium">PIN Protection</p>
                <p className="text-white/50 text-sm">Require PIN to change settings</p>
              </div>
              {settings.requirePINForSettings ? (
                <span className="text-green-400 text-sm">Active</span>
              ) : (
                <span className="text-white/40 text-sm">Not Set</span>
              )}
            </div>
            {settings.requirePINForSettings ? (
              <button
                onClick={handleRemovePIN}
                className="w-full py-2 bg-red-500/20 text-red-400 rounded-lg font-medium"
              >
                Remove PIN
              </button>
            ) : (
              <button
                onClick={() => setShowPINSetup(true)}
                className="w-full py-2 bg-purple-500 text-white rounded-lg font-medium"
              >
                Set PIN
              </button>
            )}
          </div>
        </div>

        {/* PIN Setup Modal */}
        {showPINSetup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="bg-[#1a1a2e] rounded-2xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Set PIN</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-white/50 text-sm">Enter 4-digit PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPIN}
                    onChange={(e) => setNewPIN(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest"
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-sm">Confirm PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPIN}
                    onChange={(e) => setConfirmPIN(e.target.value.replace(/\D/g, ''))}
                    className="w-full mt-1 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest"
                    placeholder="••••"
                  />
                </div>
                {pinError && <p className="text-red-400 text-sm">{pinError}</p>}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPINSetup(false);
                      setNewPIN('');
                      setConfirmPIN('');
                      setPinError('');
                    }}
                    className="flex-1 py-3 bg-white/10 text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetPIN}
                    className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium"
                  >
                    Set PIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
