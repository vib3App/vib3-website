import { VideoProcessorService } from './processor';

export const videoProcessor = new VideoProcessorService();
export type {
  ProcessingProgress,
  VideoEdits,
  TextOverlay,
  StickerOverlay,
  TuneSettings,
  CurveSettings,
  CurvePoint,
  CropSettings,
  TransformSettings,
  TransitionSettings,
  FreezeFrame,
  MaskSettings,
  ClipEdit,
} from './types';
export type { SlideshowOptions, SlideshowTransition } from './slideshow';
