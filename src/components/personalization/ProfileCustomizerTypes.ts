export interface ProfileStyle {
  headerGradient: string[];
  avatarBorder: string;
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal';
  fontStyle: 'modern' | 'classic' | 'playful' | 'elegant';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
}

export interface ProfileBadge {
  id: string;
  name: string;
  icon: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const GRADIENT_PRESETS = [
  ['#a855f7', '#ec4899'],
  ['#3b82f6', '#06b6d4'],
  ['#22c55e', '#10b981'],
  ['#f97316', '#eab308'],
  ['#ef4444', '#f97316'],
  ['#8b5cf6', '#6366f1'],
  ['#ec4899', '#f43f5e'],
  ['#14b8a6', '#22c55e'],
];

export const MOCK_BADGES: ProfileBadge[] = [
  { id: '1', name: 'Early Adopter', icon: '🌟', color: '#a855f7', rarity: 'legendary' },
  { id: '2', name: 'Content Creator', icon: '🎬', color: '#ec4899', rarity: 'epic' },
  { id: '3', name: 'Verified', icon: '✓', color: '#3b82f6', rarity: 'rare' },
  { id: '4', name: 'Top Fan', icon: '❤️', color: '#ef4444', rarity: 'common' },
  { id: '5', name: 'Trendsetter', icon: '🔥', color: '#f97316', rarity: 'epic' },
  { id: '6', name: 'Night Owl', icon: '🦉', color: '#6366f1', rarity: 'rare' },
];

export const RARITY_COLORS = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};
