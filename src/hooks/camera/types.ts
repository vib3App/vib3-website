export type RecordingState = 'idle' | 'recording' | 'paused' | 'preview';
export type CameraFacing = 'user' | 'environment';

export const CAMERA_FILTERS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.4)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.7)' },
  { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Fade', filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Drama', filter: 'contrast(1.3) brightness(0.9)' },
];

export const CAMERA_EFFECTS = [
  { name: 'None', icon: '✨' },
  { name: 'Sparkle', icon: '⭐' },
  { name: 'Hearts', icon: '💕' },
  { name: 'Confetti', icon: '🎉' },
  { name: 'Snow', icon: '❄️' },
  { name: 'Fire', icon: '🔥' },
];

export const CAMERA_SPEEDS = [
  { label: '0.3x', value: 0.3 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '3x', value: 3 },
];
