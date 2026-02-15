export interface ProfileStyle {
  headerGradient: string[];
  avatarBorder: string;
  cardStyle: 'glass' | 'solid' | 'gradient' | 'minimal';
  fontStyle: 'modern' | 'classic' | 'playful' | 'elegant';
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
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

