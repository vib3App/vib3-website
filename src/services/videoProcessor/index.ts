import { VideoProcessorService } from './processor';

export const videoProcessor = new VideoProcessorService();
export type { ProcessingProgress, VideoEdits, TextOverlay } from './types';
