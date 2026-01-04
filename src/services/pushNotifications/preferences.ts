import { apiClient } from '../api/client';
import type { NotificationPreferences } from './types';

export async function updatePreferences(preferences: NotificationPreferences): Promise<boolean> {
  try {
    await apiClient.put('/notifications/preferences', preferences);
    return true;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return false;
  }
}

export async function getPreferences(): Promise<NotificationPreferences | null> {
  try {
    const { data } = await apiClient.get<NotificationPreferences>('/notifications/preferences');
    return data;
  } catch (error) {
    console.error('Failed to get notification preferences:', error);
    return null;
  }
}
