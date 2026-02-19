'use client';

import { useState, useEffect } from 'react';
import { TwoFactorSetup } from './TwoFactorSetup';
import { ActiveSessions } from './ActiveSessions';
import { DataExport } from './DataExport';

export function SecuritySection() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vib3_2fa_enabled');
    if (stored === 'true') setTwoFactorEnabled(true);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-white font-semibold text-lg">Security</h2>

      {/* Two-Factor Authentication - Gap #72 */}
      <TwoFactorSetup enabled={twoFactorEnabled} onToggle={setTwoFactorEnabled} />

      {/* Change Password */}
      <div className="glass-card rounded-xl p-4">
        <h3 className="text-white font-medium mb-1">Password</h3>
        <p className="text-white/40 text-sm mb-3">Change your account password</p>
        <button className="px-4 py-2 glass text-white/70 text-sm rounded-lg hover:bg-white/10 transition">
          Change Password
        </button>
      </div>

      {/* Active Sessions - Gap #75 */}
      <ActiveSessions />

      {/* Data Export - Gap #74 */}
      <DataExport />
    </div>
  );
}
