/**
 * Feed Category type definitions
 * Mirrors Flutter app's feed category system
 */

export type FeedCategoryType = 'system' | 'default' | 'custom';

export type FeedOrder = 'algorithmic' | 'chronological';

export interface FeedCategorySettings {
  feedOrder: FeedOrder;
  notifications: boolean;
  vibeMeter: boolean;
}

export interface FeedCategory {
  id: string;
  name: string;
  type: FeedCategoryType;
  icon: string;
  color: string;
  order: number;
  isDeletable: boolean;
  settings: FeedCategorySettings;
  userCount?: number;
}

// Default system categories
export const SYSTEM_CATEGORIES: FeedCategory[] = [
  {
    id: 'foryou',
    name: 'For You',
    type: 'system',
    icon: '✨',
    color: '#8B5CF6', // Purple
    order: 0,
    isDeletable: false,
    settings: { feedOrder: 'algorithmic', notifications: true, vibeMeter: true },
  },
  {
    id: 'following',
    name: 'Following',
    type: 'system',
    icon: '👥',
    color: '#00BFFF', // Deep Sky Blue
    order: 1,
    isDeletable: false,
    settings: { feedOrder: 'chronological', notifications: true, vibeMeter: true },
  },
  {
    id: 'self',
    name: 'My Vib3s',
    type: 'system',
    icon: '🎬',
    color: '#9932CC', // Purple
    order: 2,
    isDeletable: false,
    settings: { feedOrder: 'chronological', notifications: false, vibeMeter: false },
  },
];

export const DEFAULT_CATEGORIES: FeedCategory[] = [
  {
    id: 'friends',
    name: 'Friends',
    type: 'default',
    icon: '🤝',
    color: '#00CED1', // Turquoise
    order: 3,
    isDeletable: false,
    settings: { feedOrder: 'chronological', notifications: true, vibeMeter: true },
  },
  {
    id: 'family',
    name: 'Family',
    type: 'default',
    icon: '🏠',
    color: '#FF6B6B', // Light Coral
    order: 4,
    isDeletable: false,
    settings: { feedOrder: 'chronological', notifications: true, vibeMeter: true },
  },
];

export const SELF_CATEGORY: FeedCategory = {
  id: 'self',
  name: 'My Vib3s',
  type: 'system',
  icon: '🎬',
  color: '#9932CC', // Purple
  order: 2,
  isDeletable: false,
  settings: { feedOrder: 'chronological', notifications: false, vibeMeter: false },
};

// Reserved category names that users cannot use
export const RESERVED_NAMES = ['for you', 'following', 'friends', 'family', 'coworkers', 'my videos', 'my vib3s', 'self'];

// Maximum custom categories allowed
export const MAX_CUSTOM_CATEGORIES = 10;

// Default settings for new categories
export const DEFAULT_CATEGORY_SETTINGS: FeedCategorySettings = {
  feedOrder: 'chronological',
  notifications: true,
  vibeMeter: true,
};

// Helper to get all default categories
export function getDefaultCategories(): FeedCategory[] {
  return [...SYSTEM_CATEGORIES, ...DEFAULT_CATEGORIES];
}

// Helper to check if a category is assignable (can have users added)
export function isAssignableCategory(category: FeedCategory): boolean {
  return category.type === 'default' || category.type === 'custom';
}
