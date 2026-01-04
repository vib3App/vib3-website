import { TIER_COLORS } from '@/types/achievement';

export function getAchievementIcon(iconName: string): string {
  const icons: Record<string, string> = {
    star: '⭐',
    video_camera: '🎥',
    fire: '🔥',
    heart: '❤️',
    eye: '👁️',
    users: '👥',
    mic: '🎤',
    trophy: '🏆',
    crown: '👑',
    rocket: '🚀',
    diamond: '💎',
    coin: '🪙',
    gift: '🎁',
    music: '🎵',
    chat: '💬',
    share: '📤',
    live: '📡',
    verified: '✓',
  };
  return icons[iconName] || '🏅';
}

export function getTierColor(tier: keyof typeof TIER_COLORS): string {
  return TIER_COLORS[tier] || TIER_COLORS.bronze;
}
