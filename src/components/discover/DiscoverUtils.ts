export function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

export const VIBES = [
  { id: 'chill', name: 'Chill', emoji: '😌', color: 'from-blue-500 to-purple-500' },
  { id: 'hype', name: 'Hype', emoji: '🔥', color: 'from-orange-500 to-pink-500' },
  { id: 'dark', name: 'Dark', emoji: '🌙', color: 'from-gray-800 to-purple-900' },
  { id: 'funny', name: 'Funny', emoji: '😂', color: 'from-yellow-400 to-orange-500' },
  { id: 'aesthetic', name: 'Aesthetic', emoji: '✨', color: 'from-pink-400 to-purple-400' },
  { id: 'learn', name: 'Learn', emoji: '🧠', color: 'from-green-400 to-teal-500' },
];

export const CATEGORIES = ['Music', 'Dance', 'Comedy', 'Sports', 'Food', 'Gaming', 'Fashion', 'Art'];
