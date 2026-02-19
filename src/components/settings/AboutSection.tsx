'use client';

import Link from 'next/link';
import { SettingsCard, SettingsLink } from './SettingsComponents';

/**
 * Gap #86: App Version Display
 * Shows version from package.json (injected at build time) plus build date.
 */
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
const BUILD_DATE = process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0];

export function AboutSection() {
  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsLink label="Terms of Service" onClick={() => window.open('/terms', '_blank')} />
        <SettingsLink label="Privacy Policy" onClick={() => window.open('/privacy', '_blank')} />
        <SettingsLink label="Community Guidelines" onClick={() => window.open('/community-guidelines', '_blank')} />
      </SettingsCard>

      {/* Version info */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <h3 className="text-white/50 text-sm font-medium">App Info</h3>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Version</span>
          <span className="text-white/60 text-sm font-mono">VIB3 Web v{APP_VERSION}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Build Date</span>
          <span className="text-white/60 text-sm font-mono">{BUILD_DATE}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white text-sm">Platform</span>
          <span className="text-white/60 text-sm">Web (Next.js)</span>
        </div>
      </div>

      <div className="text-center text-white/30 text-sm py-4">
        VIB3 Web v{APP_VERSION} (Build {BUILD_DATE})
      </div>

      <div className="text-center">
        <Link href="/community-guidelines" className="text-purple-400 text-xs hover:underline">
          Report a Problem
        </Link>
      </div>
    </div>
  );
}
