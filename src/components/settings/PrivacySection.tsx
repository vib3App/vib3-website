'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsCard, SettingsToggle, SettingsLink } from './SettingsComponents';
import { PrivacyLevelPicker } from './PrivacyLevelPicker';
import { CallPermissions } from '@/components/call/CallPermissions';
import { callsApi } from '@/services/api/calls';
import {
  privacyApi,
  type PrivacyLevel,
  type PrivacySettingsUpdate,
} from '@/services/api/privacy';
import { logger } from '@/utils/logger';

type CallPermission = 'everyone' | 'followers' | 'mutual' | 'nobody';

// Web-facing privacy state. Field names align with backend wherever a 1:1
// mapping exists; aliases used only for legacy UI labels.
interface PrivacyState {
  // Account
  privateAccount: boolean;        // → requireFollowApproval
  suggestAccount: boolean;        // → suggestAccount
  syncContacts: boolean;          // → syncContacts
  // Interactions
  allowComments: boolean;
  allowMessages: boolean;         // legacy binary, kept alongside messageVisibility
  allowEcho: boolean;
  allowBounce: boolean;
  allowDownloads: boolean;
  filterOffensiveComments: boolean;
  // Visibility pickers
  messageVisibility: PrivacyLevel;   // who can DM
  videoVisibility: PrivacyLevel;     // who can view liked videos (closest mapping)
  // Personalization
  adsPersonalization: boolean;
  // Call permission (separate API)
  callPermission: CallPermission;
}

const defaultState: PrivacyState = {
  privateAccount: false,
  suggestAccount: true,
  syncContacts: false,
  allowComments: true,
  allowMessages: true,
  allowEcho: true,
  allowBounce: true,
  allowDownloads: true,
  filterOffensiveComments: false,
  messageVisibility: 'friends',
  videoVisibility: 'public',
  adsPersonalization: true,
  callPermission: 'everyone',
};

const LEGACY_STORAGE_KEY = 'vib3_privacy_settings';

function clearLegacyStorage() {
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* ignore */ }
  }
}

type ToggleKey =
  | 'privateAccount' | 'suggestAccount' | 'syncContacts'
  | 'allowComments' | 'allowMessages' | 'allowEcho' | 'allowBounce'
  | 'allowDownloads' | 'filterOffensiveComments' | 'adsPersonalization';

function toggleToBackend(uiKey: ToggleKey, next: boolean): PrivacySettingsUpdate {
  switch (uiKey) {
    case 'privateAccount': return { requireFollowApproval: next };
    case 'suggestAccount': return { suggestAccount: next };
    case 'syncContacts': return { syncContacts: next };
    case 'allowComments': return { allowComments: next };
    case 'allowMessages': return { allowMessages: next };
    case 'allowEcho': return { allowEcho: next };
    case 'allowBounce': return { allowBounce: next };
    case 'allowDownloads': return { allowDownloads: next };
    case 'filterOffensiveComments': return { filterOffensiveComments: next };
    case 'adsPersonalization': return { adsPersonalization: next };
  }
}

export function PrivacySection() {
  const router = useRouter();
  const [state, setState] = useState<PrivacyState>(defaultState);
  const [loaded, setLoaded] = useState(false);

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
        suggestAccount: privacy?.suggestAccount ?? defaultState.suggestAccount,
        syncContacts: privacy?.syncContacts ?? defaultState.syncContacts,
        allowComments: privacy?.allowComments ?? defaultState.allowComments,
        allowMessages: privacy?.allowMessages ?? defaultState.allowMessages,
        allowEcho: privacy?.allowEcho ?? defaultState.allowEcho,
        allowBounce: privacy?.allowBounce ?? defaultState.allowBounce,
        allowDownloads: privacy?.allowDownloads ?? defaultState.allowDownloads,
        filterOffensiveComments: privacy?.filterOffensiveComments ?? defaultState.filterOffensiveComments,
        messageVisibility: privacy?.messageVisibility ?? defaultState.messageVisibility,
        videoVisibility: privacy?.videoVisibility ?? defaultState.videoVisibility,
        adsPersonalization: privacy?.adsPersonalization ?? defaultState.adsPersonalization,
        callPermission: (callPrivacy?.permission as CallPermission) ?? defaultState.callPermission,
      });
      setLoaded(true);
      clearLegacyStorage();
    })();
    return () => { cancelled = true; };
  }, []);

  const persistToggle = async (uiKey: ToggleKey, next: boolean) => {
    setState(prev => ({ ...prev, [uiKey]: next }));
    const result = await privacyApi.updateSettings(toggleToBackend(uiKey, next));
    if (!result) {
      setState(prev => ({ ...prev, [uiKey]: !next }));
      logger.error(`Failed to save privacy toggle: ${uiKey}`);
    }
  };

  const persistLevel = async (field: 'messageVisibility' | 'videoVisibility', value: PrivacyLevel) => {
    const previous = state[field];
    setState(prev => ({ ...prev, [field]: value }));
    const result = await privacyApi.updateSettings({ [field]: value });
    if (!result) {
      setState(prev => ({ ...prev, [field]: previous }));
      logger.error(`Failed to save privacy level: ${field}`);
    }
  };

  const toggle = (k: ToggleKey) => loaded && void persistToggle(k, !state[k]);

  return (
    <div className="space-y-4">
      {/* Account / Discoverability */}
      <SettingsCard>
        <SettingsToggle
          label="Private Account"
          description="Only approved followers can see your content"
          enabled={state.privateAccount}
          onChange={() => toggle('privateAccount')}
        />
        <SettingsToggle
          label="Suggest your account to others"
          description="Let VIB3 recommend your profile to other users"
          enabled={state.suggestAccount}
          onChange={() => toggle('suggestAccount')}
        />
        <SettingsToggle
          label="Sync Contacts"
          description="Match phone contacts to find friends on VIB3"
          enabled={state.syncContacts}
          onChange={() => toggle('syncContacts')}
        />
      </SettingsCard>

      {/* Interactions */}
      <SettingsCard>
        <SettingsToggle
          label="Allow Comments"
          description="Let others comment on your videos"
          enabled={state.allowComments}
          onChange={() => toggle('allowComments')}
        />
        <SettingsToggle
          label="Filter Offensive Comments"
          description="Auto-hide comments flagged as offensive"
          enabled={state.filterOffensiveComments}
          onChange={() => toggle('filterOffensiveComments')}
        />
        <SettingsToggle
          label="Allow Messages"
          description="Let others send you direct messages"
          enabled={state.allowMessages}
          onChange={() => toggle('allowMessages')}
        />
        <SettingsToggle
          label="Allow Echo"
          description="Let others record echo responses to your videos"
          enabled={state.allowEcho}
          onChange={() => toggle('allowEcho')}
        />
        <SettingsToggle
          label="Allow Bounce"
          description="Let others bounce off your videos"
          enabled={state.allowBounce}
          onChange={() => toggle('allowBounce')}
        />
        <SettingsToggle
          label="Allow Downloads"
          description="Let viewers download your videos"
          enabled={state.allowDownloads}
          onChange={() => toggle('allowDownloads')}
        />
      </SettingsCard>

      {/* Visibility */}
      <SettingsCard>
        <PrivacyLevelPicker
          label="Who can send you direct messages"
          description="Limit DMs to followers or mutual friends"
          value={state.messageVisibility}
          onChange={(level) => loaded && void persistLevel('messageVisibility', level)}
        />
        <PrivacyLevelPicker
          label="Who can view your liked videos"
          description="Hide your liked list from non-friends"
          value={state.videoVisibility}
          onChange={(level) => loaded && void persistLevel('videoVisibility', level)}
        />
      </SettingsCard>

      {/* Personalization */}
      <SettingsCard>
        <SettingsToggle
          label="Ads Personalization"
          description="Show ads based on your activity"
          enabled={state.adsPersonalization}
          onChange={() => toggle('adsPersonalization')}
        />
      </SettingsCard>

      {/* Safety links */}
      <SettingsCard>
        <SettingsLink
          label="Location privacy"
          onClick={() => router.push('/location?settings=privacy')}
        />
        <SettingsLink
          label="Location circles"
          onClick={() => router.push('/circles')}
        />
        <SettingsLink
          label="Blocked Accounts"
          onClick={() => router.push('/settings/blocked')}
        />
        <SettingsLink
          label="Download Your Data"
          onClick={() => router.push('/settings/download-data')}
        />
      </SettingsCard>

      {/* Calls (separate API) */}
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
