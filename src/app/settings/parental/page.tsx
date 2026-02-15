'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { ToggleSetting, ButtonGroup, PINSetupModal, PINSection } from '@/components/settings/parental';

interface ParentalSettings {
  restrictedMode: boolean;
  screenTimeLimit: number | null;
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

const AGE_OPTIONS = [
  { value: 'all' as const, label: 'All Ages' },
  { value: '13+' as const, label: '13+' },
  { value: '16+' as const, label: '16+' },
  { value: '18+' as const, label: '18+' },
];

const TIME_OPTIONS = [
  { value: null, label: 'None' },
  { value: 30, label: '30m' },
  { value: 60, label: '1h' },
  { value: 120, label: '2h' },
];

export default function ParentalControlsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<ParentalSettings>(DEFAULT_SETTINGS);
  const [showPINSetup, setShowPINSetup] = useState(false);
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const saved = localStorage.getItem('parentalSettings');
      if (saved && !cancelled) {
        try { setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) }); } catch { /* ignore */ }
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const updateSetting = <K extends keyof ParentalSettings>(key: K, value: ParentalSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('parentalSettings', JSON.stringify(updated));
  };

  const handleSetPIN = () => {
    if (newPIN.length !== 4 || !/^\d+$/.test(newPIN)) { setPinError('PIN must be 4 digits'); return; }
    if (newPIN !== confirmPIN) { setPinError('PINs do not match'); return; }
    updateSetting('pin', newPIN);
    updateSetting('requirePINForSettings', true);
    closePINSetup();
  };

  const closePINSetup = () => {
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
        <PageHeader onBack={() => router.back()} />
        <InfoBanner />
        <div className="space-y-4">
          <ToggleSetting title="Restricted Mode" description="Hide potentially mature content" enabled={settings.restrictedMode} onToggle={() => updateSetting('restrictedMode', !settings.restrictedMode)} />
          <ButtonGroup title="Age Restriction" options={AGE_OPTIONS} selected={settings.ageRestriction} onSelect={(v) => updateSetting('ageRestriction', v)} />
          <ButtonGroup title="Daily Screen Time Limit" options={TIME_OPTIONS} selected={settings.screenTimeLimit} onSelect={(v) => updateSetting('screenTimeLimit', v)} />
          <ToggleSetting title="Hide Mature Content" description="Filter age-restricted videos" enabled={settings.hideMatureContent} onToggle={() => updateSetting('hideMatureContent', !settings.hideMatureContent)} />
          <ToggleSetting title="Disable Comments" description="Hide all comments on videos" enabled={settings.disableComments} onToggle={() => updateSetting('disableComments', !settings.disableComments)} />
          <ToggleSetting title="Disable Direct Messages" description="Prevent receiving messages" enabled={settings.disableDMs} onToggle={() => updateSetting('disableDMs', !settings.disableDMs)} />
          <PINSection isActive={settings.requirePINForSettings} onSetPIN={() => setShowPINSetup(true)} onRemovePIN={handleRemovePIN} />
        </div>
        <PINSetupModal
          isOpen={showPINSetup}
          newPIN={newPIN}
          confirmPIN={confirmPIN}
          error={pinError}
          onNewPINChange={setNewPIN}
          onConfirmPINChange={setConfirmPIN}
          onCancel={closePINSetup}
          onSubmit={handleSetPIN}
        />
      </div>
    </div>
  );
}

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={onBack} className="text-white/60 hover:text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      <h1 className="text-2xl font-bold text-white">Parental Controls</h1>
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
      <div className="flex gap-3">
        <span className="text-2xl">👨‍👩‍👧</span>
        <div>
          <h3 className="text-white font-medium mb-1">Family Safety</h3>
          <p className="text-white/60 text-sm">Control what content is accessible and set limits for a safer experience.</p>
        </div>
      </div>
    </div>
  );
}
