export const EDITOR_FILTERS = [
  { name: 'Normal', filter: 'none' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.4)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.7)' },
  { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Fade', filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Drama', filter: 'contrast(1.3) brightness(0.9)' },
  { name: 'Cinema', filter: 'contrast(1.2) saturate(0.9) brightness(1.1)' },
  { name: 'Retro', filter: 'sepia(0.4) saturate(1.2) brightness(0.9) hue-rotate(10deg)' },
  { name: 'Noir', filter: 'grayscale(1) contrast(1.3) brightness(0.9)' },
  { name: 'Pastel', filter: 'saturate(0.6) brightness(1.15) contrast(0.9)' },
  { name: 'Neon', filter: 'saturate(2) contrast(1.2) brightness(1.05) hue-rotate(20deg)' },
  { name: 'Sunset', filter: 'sepia(0.3) saturate(1.6) hue-rotate(340deg) brightness(1.05)' },
  { name: 'Ocean', filter: 'saturate(0.9) hue-rotate(200deg) brightness(1.05)' },
  { name: 'Forest', filter: 'saturate(0.8) hue-rotate(90deg) brightness(0.95)' },
  { name: 'Autumn', filter: 'sepia(0.3) saturate(1.4) hue-rotate(10deg) brightness(0.95)' },
  { name: 'Winter', filter: 'saturate(0.5) brightness(1.1) hue-rotate(200deg) contrast(0.95)' },
  { name: 'Spring', filter: 'saturate(1.3) brightness(1.1) hue-rotate(30deg)' },
  { name: 'Tokyo', filter: 'contrast(1.15) saturate(1.3) hue-rotate(300deg) brightness(0.95)' },
  { name: 'Paris', filter: 'sepia(0.2) contrast(0.95) brightness(1.1) saturate(0.9)' },
  { name: 'LA', filter: 'saturate(1.3) brightness(1.15) contrast(1.05)' },
  { name: 'Moody', filter: 'contrast(1.2) brightness(0.8) saturate(0.7)' },
  { name: 'Bright', filter: 'brightness(1.2) contrast(1.05) saturate(1.1)' },
  { name: 'Soft', filter: 'contrast(0.85) brightness(1.1) saturate(0.9)' },
  { name: 'Sharp', filter: 'contrast(1.3) brightness(1.05) saturate(1.1)' },
  { name: 'Matte', filter: 'contrast(0.9) brightness(1.05) saturate(0.8)' },
  { name: 'Film', filter: 'sepia(0.2) contrast(1.1) saturate(0.9) brightness(0.95)' },
  { name: 'Chrome', filter: 'saturate(1.8) contrast(1.15) brightness(1.05)' },
  { name: 'Clarendon', filter: 'contrast(1.2) saturate(1.35)' },
];

export type EditMode = 'trim' | 'filters' | 'tune' | 'blur' | 'text' | 'stickers' | 'audio' | 'speed' | 'transitions' | 'greenscreen' | 'templates' | 'transform' | 'voiceover' | 'crop' | 'opacity' | 'masks' | 'captions' | 'split' | 'draw' | 'sfx' | 'beatsync' | 'freeze' | 'cutout' | 'stabilize' | 'clipspeed' | 'aiauto' | 'music' | 'voiceeffects' | 'transitions3d' | 'speedramp' | 'giphy' | 'customfonts' | 'textanim' | 'textpath' | 'karaoke' | 'translate' | 'shopping' | 'narration';

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface GiphyStickerOverlay {
  id: string;
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
}

export interface SpeedKeyframe {
  time: number;
  speed: number;
}

export interface TextAnimation {
  type: string;
  duration: number;
}

export type TextPathType = 'straight' | 'arc' | 'wave' | 'circle' | 'spiral';

export interface CaptionWord {
  word: string;
  startTime: number;
  endTime: number;
}

export interface VoiceEffect {
  id: string;
  name: string;
  type: 'pitch' | 'delay' | 'modulation';
  params: Record<string, number>;
}
