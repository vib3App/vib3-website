/**
 * Snap Camera Kit configuration
 * API token loaded from NEXT_PUBLIC_SNAP_CAMERA_KIT_TOKEN env var
 */

export const SNAP_CAMERA_KIT_TOKEN =
  process.env.NEXT_PUBLIC_SNAP_CAMERA_KIT_TOKEN ?? '';

export const SNAP_WEB_LENS_GROUP_ID = '15031bab-332a-435c-bbc6-6de391b388a8';

/** Effect categories for the effects toolbar (Gap 3) */
export const EFFECT_CATEGORIES = [
  { id: 'green-screen', label: 'Green Screen', icon: 'screen' },
  { id: 'beauty', label: 'Beauty', icon: 'sparkle' },
  { id: 'masks', label: 'Masks', icon: 'mask' },
  { id: 'fun', label: 'Fun', icon: 'smile' },
  { id: 'effects', label: 'Effects', icon: 'wand' },
] as const;

export type EffectCategoryId = (typeof EFFECT_CATEGORIES)[number]['id'];
