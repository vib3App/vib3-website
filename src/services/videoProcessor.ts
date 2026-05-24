/**
 * Video Processor Service
 * Re-exports from refactored videoProcessor module
 */
export { videoProcessor } from './videoProcessor/index';
export type {
  ProcessingProgress,
  VideoEdits,
  TextOverlay,
  StickerOverlay,
  TuneSettings,
  CropSettings,
  TransformSettings,
  TransitionSettings,
  FreezeFrame,
  MaskSettings,
  ClipEdit,
  SlideshowOptions,
  SlideshowTransition,
} from './videoProcessor/index';
