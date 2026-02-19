'use client';

import { useState, useEffect, useCallback } from 'react';

export type CookiePreference = 'all' | 'essential' | 'custom';

export interface CookieSettings {
  essential: boolean;  // always true
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const STORAGE_KEY = 'vib3_cookie_consent';

function getSavedConsent(): CookieSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveConsent(settings: CookieSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const saved = getSavedConsent();
    if (!saved) {
      // Small delay so it doesn't flash immediately
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allSettings: CookieSettings = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allSettings);
    setVisible(false);
  }, []);

  const handleRejectNonEssential = useCallback(() => {
    const essentialOnly: CookieSettings = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(essentialOnly);
    setVisible(false);
  }, []);

  const handleSaveCustom = useCallback(() => {
    saveConsent({ ...settings, essential: true });
    setVisible(false);
  }, [settings]);

  const toggleSetting = useCallback((key: keyof Omit<CookieSettings, 'essential'>) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 transition-transform duration-500 translate-y-0">
      <div className="max-w-2xl mx-auto glass-heavy rounded-2xl border border-white/10 p-6 shadow-2xl">
        {!showCustomize ? (
          <>
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 className="text-white font-semibold text-sm">Cookie Preferences</h3>
                <p className="text-white/50 text-xs mt-1 leading-relaxed">
                  We use cookies to enhance your experience, analyze site traffic, and personalize content.
                  You can choose which cookies to accept.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectNonEssential}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/15 transition"
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowCustomize(true)}
                className="px-4 py-2 text-purple-400 text-sm font-medium hover:text-purple-300 transition"
              >
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-white font-semibold text-sm mb-3">Customize Cookies</h3>

            <div className="space-y-3 mb-4">
              <CookieToggle
                label="Essential"
                description="Required for the site to function. Cannot be disabled."
                checked={true}
                disabled={true}
                onChange={() => {}}
              />
              <CookieToggle
                label="Analytics"
                description="Help us understand how visitors use our site."
                checked={settings.analytics}
                onChange={() => toggleSetting('analytics')}
              />
              <CookieToggle
                label="Marketing"
                description="Used for targeted advertising and social media features."
                checked={settings.marketing}
                onChange={() => toggleSetting('marketing')}
              />
              <CookieToggle
                label="Preferences"
                description="Remember your settings and personalization choices."
                checked={settings.preferences}
                onChange={() => toggleSetting('preferences')}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 text-white/50 text-sm hover:text-white transition"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CookieToggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1">
        <p className="text-white text-xs font-medium">{label}</p>
        <p className="text-white/40 text-xs">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled}
        className={`relative w-10 h-5 rounded-full transition ${
          checked ? 'bg-purple-500' : 'bg-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
