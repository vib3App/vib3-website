'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsCard, SettingsToggle, SettingsLink } from './SettingsComponents';
import { CallPermissions } from '@/components/call/CallPermissions';
import { callsApi } from '@/services/api/calls';
import { privacyApi, type PrivacySettingsUpdate } from '@/services/api/privacy';
import { logger } from '@/utils/logger';

type CallPermission = 'everyone' | 'followers' | 'mutual' | 'nobody';

// Web-facing privacy state. The fields map to the backend like this:
//   privateAccount → requireFollowApproval
//   allowDuets     → allowEcho (Flutter calls it Echo)
//   allowComments  → allowComments
//   allowMessages  → allowMessages
interface PrivacyState {
  privateAccount: boolean;
  allowComments: boolean;
  allowMessages: boolean;
  allowDuets: boolean;
  callPermission: CallPermission;
}

const defaultState: PrivacyState = {
  privateAccount: false,
  allowComments: true,
  allowMessages: true,
  allowDuets: true,
  callPermission: 'everyone',
};

const LEGACY_STORAGE_KEY = 'vib3_privacy_settings';

function clearLegacyStorage() {
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* ignore */ }
  }
}

export function PrivacySection() {
  const router = useRouter();
  const [state, setState] = useState<PrivacyState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  // Load saved settings from the server. Falls back to defaults on failure.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [privacy, callPrivacy] = await Promise.all([
        privacyApi.getSettings(),
        callsApi.getCallPrivacy().catch(() => ({ permission: 'everyone' as CallPermission })),
      ]);
      if (cancelled) return;
      setState({
        privateAccount: privacy?.requireFollowApproval ?? defaultState.privateAccount,
        allowComments: privacy?.allowComments ?? defaultState.allowComments,
        allowMessages: privacy?.allowMessages ?? defaultState.allowMessages,
        allowDuets: privacy?.allowEcho ?? defaultState.allowDuets,
        callPermission: (callPrivacy?.permission as CallPermission) ?? defaultState.callPermission,
      });
      setLoaded(true);
      clearLegacyStorage();
    })();
    return () => { cancelled = true; };
  }, []);

  const persistToggle = async (uiKey: keyof Omit<PrivacyState, 'callPermission'>, next: boolean) => {
    // Optimistic UI; revert on failure.
    setState(prev => ({ ...prev, [uiKey]: next }));

    const updates: PrivacySettingsUpdate = (() => {
      switch (uiKey) {
        case 'privateAccount': return { requireFollowApproval: next };
        case 'allowComments': return { allowComments: next };
        case 'allowMessages': return { allowMessages: next };
        case 'allowDuets': return { allowEcho: next };
      }
    })();

    const result = await privacyApi.updateSettings(updates);
    if (!result) {
      setState(prev => ({ ...prev, [uiKey]: !next }));
      logger.error(`Failed to save privacy toggle: ${uiKey}`);
    }
  };

  return (
    <div className="space-y-4">
      <SettingsCard>
        <SettingsToggle
          label="Private Account"
          description="Only approved followers can see your content"
          enabled={state.privateAccount}
          onChange={() => loaded && void persistToggle('privateAccount', !state.privateAccount)}
        />
        <SettingsToggle
          label="Allow Comments"
          description="Let others comment on your videos"
          enabled={state.allowComments}
          onChange={() => loaded && void persistToggle('allowComments', !state.allowComments)}
        />
        <SettingsToggle
          label="Allow Messages"
          description="Let others send you direct messages"
          enabled={state.allowMessages}
          onChange={() => loaded && void persistToggle('allowMessages', !state.allowMessages)}
        />
        <SettingsToggle
          label="Allow Duets"
          description="Let others create duets with your videos"
          enabled={state.allowDuets}
          onChange={() => loaded && void persistToggle('allowDuets', !state.allowDuets)}
        />
      </SettingsCard>
      <SettingsCard>
        <SettingsLink
          label="Blocked Accounts"
          onClick={() => router.push('/settings/blocked')}
        />
        <SettingsLink
          label="Download Your Data"
          onClick={() => router.push('/settings/download-data')}
        />
      </SettingsCard>
      <SettingsCard>
        <CallPermissions
          currentPermission={state.callPermission}
          onPermissionChange={(perm) => {
            const prev = state.callPermission;
            setState(s => ({ ...s, callPermission: perm }));
            callsApi.updateCallPrivacy(perm).catch(err => {
              setState(s => ({ ...s, callPermission: prev }));
              logger.error('Failed to update call privacy:', err);
            });
          }}
          blockedUsers={[]}
          onUnblockUser={() => {}}
        />
      </SettingsCard>
    </div>
  );
}
