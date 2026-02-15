export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xp: number;
  tier: AchievementTierLevel;
  tierInfo?: AchievementTier;
  target?: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: AchievementProgress;
}

interface AchievementTier {
  order: number;
  color: string;
  name: string;
}

interface AchievementProgress {
  current: number;
  target: number;
  percentage: number;
}

export interface AchievementStats {
  totalXp: number;
  level: number;
  nextLevelXp: number;
  currentLevelXp: number;
  xpProgress: number;
  unlockedCount: number;
  totalCount: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profilePicture?: string;
  isVerified: boolean;
  totalXp: number;
  level: number;
  achievementCount: number;
}

export type AchievementCategory =
  | 'content'
  | 'community'
  | 'engagement'
  | 'views'
  | 'live'
  | 'monetization'
  | 'special'
  | 'all';

type AchievementTierLevel = 'bronze' | 'silver' | 'gold' | 'diamond';

export const ACHIEVEMENT_CATEGORIES: { id: AchievementCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🏆' },
  { id: 'content', label: 'Content Creation', icon: '🎬' },
  { id: 'community', label: 'Community', icon: '👥' },
  { id: 'engagement', label: 'Engagement', icon: '💬' },
  { id: 'views', label: 'Views & Reach', icon: '👁️' },
  { id: 'live', label: 'Live Streaming', icon: '📡' },
  { id: 'monetization', label: 'Monetization', icon: '💰' },
  { id: 'special', label: 'Special', icon: '⭐' },
];

export const TIER_COLORS: Record<AchievementTierLevel, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#00CED1',
};

