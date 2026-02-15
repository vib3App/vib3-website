export interface ProcessingProgress {
  stage: 'loading' | 'processing' | 'encoding' | 'complete' | 'error';
  percent: number;
  message: string;
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
}

export interface TextOverlay {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

export interface StickerOverlay {
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}
