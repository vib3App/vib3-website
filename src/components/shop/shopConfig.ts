import type { ProductCategory } from '@/types/shop';

export interface CategoryConfig {
  id: ProductCategory | 'all';
  label: string;
  icon: string;
}

export const categories: CategoryConfig[] = [
  { id: 'all', label: 'All', icon: '🛍️' },
  { id: 'effects', label: 'Effects & Filters', icon: '✨' },
  { id: 'digital', label: 'Digital Items', icon: '💎' },
  { id: 'creator', label: 'Creator Tools', icon: '🎬' },
  { id: 'merch', label: 'Merchandise', icon: '👕' },
];

export const categoryIcons: Record<string, string> = {
  effects: '✨',
  digital: '💎',
  creator: '🎬',
  merch: '👕',
  subscription: '🔄',
  bundle: '📦',
};
