export interface ProcessingProgress {
  stage: 'loading' | 'processing' | 'encoding' | 'complete' | 'error';
  percent: number;
  message: string;
}

export interface TuneSettings {
  brightness: number;  // -1 to 1 (0 = no change)
  contrast: number;    // 0.5 to 2 (1 = no change)
  saturation: number;  // 0 to 3 (1 = no change)
  exposure: number;    // -1 to 1 (0 = no change)
}

export interface CropSettings {
  aspect: string | null;  // e.g. '9:16', '16:9', '1:1', '4:5', '4:3', or null for free
  x: number;              // crop region x offset (0-1 normalized)
  y: number;              // crop region y offset (0-1 normalized)
  width: number;          // crop region width (0-1 normalized)
  height: number;         // crop region height (0-1 normalized)
}

export interface TransformSettings {
  rotation: number;  // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface TransitionSettings {
  type: string;       // 'none', 'crossfade', 'fade-black', 'wipe', etc.
  duration: number;   // seconds
}

export interface FreezeFrame {
  time: number;      // position in video (seconds)
  duration: number;  // how long the freeze lasts (seconds)
}

export interface MaskSettings {
  shape: string | null;  // 'circle', 'rectangle', 'heart', etc.
  invert: boolean;
  feather: number;       // 0-50 px
}

export interface ClipEdit {
  id: string;
  startTime: number;
  endTime: number;
  speed: number;
}

export interface VideoEdits {
  trimStart?: number;
  trimEnd?: number;
  filter?: string;
  volume?: number;
  texts?: TextOverlay[];
  stickers?: StickerOverlay[];
  videoWidth?: number;
  videoHeight?: number;
  displayHeight?: number;
  musicUrl?: string;
  musicVolume?: number;
  // Gap 18: Tune adjustments
  tune?: TuneSettings;
  // Gap 19: Blur
  blur?: number;  // blur radius in px (0 = off)
  // Gap 29: Crop
  crop?: CropSettings;
  // Gap 30: Transform/rotate
  transform?: TransformSettings;
  // Gap 31: Transitions (between clips)
  transition?: TransitionSettings;
  // Gap 32: Opacity/blend
  opacity?: number;       // 0-1
  blendMode?: string;
  // Gap 33: Mask shapes
  mask?: MaskSettings;
  // Gap 34: Freeze frames
  freezeFrames?: FreezeFrame[];
  // Gap 35: Per-clip speeds
  clipEdits?: ClipEdit[];
  // Stabilization (deshake filter)
  stabilization?: { enabled: boolean; strength: number };
  // Green screen chroma key
  greenScreen?: { enabled: boolean; color: string; sensitivity: number };
  // Cutout / BG removal (colorkey mode)
  cutout?: { mode: 'off' | 'auto' | 'colorkey'; color: string; sensitivity: number };
  // Speed ramp keyframes
  speedRamp?: { time: number; speed: number }[];
  // Voice effect
  voiceEffect?: string;
}

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
