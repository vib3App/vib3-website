/**
 * Privacy settings API.
 *
 * Backend routes (see `routes/privacy-routes.js`):
 *   GET  /api/privacy/settings          → caller's settings (or defaults)
 *   GET  /api/privacy/settings/:userId  → same, self-only (matches Flutter URL)
 *   PUT  /api/privacy/settings          → partial update, returns merged
 *
 * The backend stores everything as a sub-doc on the user. Flutter's
 * PrivacyService (lib/services/privacy_service.dart) calls the same endpoints,
 * so any toggle wired here also starts persisting on the Flutter side.
 */

import { apiClient } from './client';
import { logger } from '@/utils/logger';

export type PrivacyLevel = 'public' | 'friends' | 'private';

export interface ServerPrivacySettings {
  userId: string;
  profileVisibility: PrivacyLevel;
  videoVisibility: PrivacyLevel;
  messageVisibility: PrivacyLevel;
  allowComments: boolean;
  allowEcho: boolean;
  allowBounce: boolean;
  allowReactions: boolean;
  allowDownloads: boolean;
  allowMentions: boolean;
  allowTagging: boolean;
  allowMessages: boolean;
  showOnlineStatus: boolean;
  showActivity: boolean;
  showFollowingList: boolean;
  showFollowersList: boolean;
  showLikedVideos: boolean;
  enableTwoFactor: boolean;
  requireFollowApproval: boolean;
  filterOffensiveComments: boolean;
  restrictedMode: boolean;
  suggestAccount: boolean;
  syncContacts: boolean;
  adsPersonalization: boolean;
  lastUpdated: string;
}

export type PrivacySettingsUpdate = Partial<Omit<ServerPrivacySettings, 'userId' | 'lastUpdated'>>;

export const privacyApi = {
  async getSettings(): Promise<ServerPrivacySettings | null> {
    try {
      const { data } = await apiClient.get<ServerPrivacySettings>('/privacy/settings');
      return data;
    } catch (err) {
      logger.error('privacyApi.getSettings failed:', err);
      return null;
    }
  },

  async updateSettings(updates: PrivacySettingsUpdate): Promise<ServerPrivacySettings | null> {
    try {
      const { data } = await apiClient.put<ServerPrivacySettings>('/privacy/settings', updates);
      return data;
    } catch (err) {
      logger.error('privacyApi.updateSettings failed:', err);
      return null;
    }
  },
};
