import { VideoProcessorService } from './processor';

export const videoProcessor = new VideoProcessorService();
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
} from './types';
