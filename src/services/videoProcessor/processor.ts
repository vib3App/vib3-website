import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { ProcessingProgress, VideoEdits, ClipEdit, FreezeFrame } from './types';
import { buildFFmpegArgs, renderOverlaysToImage } from './filters';
import {
  splitVideoImpl,
  applyTransitionImpl,
  insertFreezeFramesImpl,
  processClipSpeedsImpl,
} from './advancedProcessing';
import { logger } from '@/utils/logger';

export class VideoProcessorService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async load(onProgress?: (progress: ProcessingProgress) => void): Promise<boolean> {
    if (this.isLoaded) return true;
    if (this.isLoading && this.loadPromise) {
      await this.loadPromise;
      return this.isLoaded;
    }

    this.isLoading = true;
    onProgress?.({ stage: 'loading', percent: 0, message: 'Loading video processor...' });

    this.loadPromise = (async () => {
      try {
        this.ffmpeg = new FFmpeg();
        this.ffmpeg.on('log', () => {});
        this.ffmpeg.on('progress', ({ progress }) => {
          const percent = Math.round(progress * 100);
          onProgress?.({ stage: 'processing', percent, message: `Processing: ${percent}%` });
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        this.isLoaded = true;
        onProgress?.({ stage: 'loading', percent: 100, message: 'Processor ready' });
      } catch (error) {
        logger.error('Failed to load FFmpeg:', error);
        onProgress?.({ stage: 'error', percent: 0, message: 'Failed to load processor' });
        throw error;
      }
    })();

    try {
      await this.loadPromise;
      return true;
    } catch {
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  get loaded(): boolean {
    return this.isLoaded;
  }

  private async ensureLoaded(onProgress?: (p: ProcessingProgress) => void): Promise<boolean> {
    if (!this.ffmpeg || !this.isLoaded) {
      return await this.load(onProgress);
    }
    return true;
  }

  async processVideo(inputFile: File | Blob | string, edits: VideoEdits, onProgress?: (progress: ProcessingProgress) => void): Promise<Blob | null> {
    if (!(await this.ensureLoaded(onProgress))) return null;

    try {
      onProgress?.({ stage: 'processing', percent: 0, message: 'Preparing video...' });
      const inputData = await this.getInputData(inputFile);
      await this.ffmpeg!.writeFile('input.mp4', inputData);

      let hasOverlay = false;
      let hasMusic = false;
      const texts = edits.texts || [];
      const stickers = edits.stickers || [];
      if ((texts.length > 0 || stickers.length > 0 || edits.drawingDataUrl) && edits.videoWidth && edits.videoHeight) {
        const overlayData = await renderOverlaysToImage(texts, stickers, edits.videoWidth, edits.videoHeight, edits.displayHeight, edits.drawingDataUrl);
        if (overlayData) {
          await this.ffmpeg!.writeFile('overlay.png', overlayData);
          hasOverlay = true;
        }
      }

      if (edits.musicUrl) {
        try {
          const musicData = await fetchFile(edits.musicUrl);
          await this.ffmpeg!.writeFile('music.mp3', musicData);
          hasMusic = true;
        } catch (e) {
          logger.error('Failed to fetch music track:', e);
        }
      }

      let args = buildFFmpegArgs(edits, hasOverlay, hasMusic);

      onProgress?.({ stage: 'encoding', percent: 0, message: 'Encoding video...' });
      try {
        await this.ffmpeg!.exec(args);
      } catch (execError) {
        if (hasMusic && edits.volume !== undefined) {
          const fallbackEdits = { ...edits, volume: 0 };
          args = buildFFmpegArgs(fallbackEdits, hasOverlay, hasMusic);
          await this.ffmpeg!.exec(args);
        } else {
          throw execError;
        }
      }

      const data = await this.ffmpeg!.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

      await this.ffmpeg!.deleteFile('input.mp4');
      if (hasOverlay) await this.ffmpeg!.deleteFile('overlay.png');
      if (hasMusic) await this.ffmpeg!.deleteFile('music.mp3');
      await this.ffmpeg!.deleteFile('output.mp4');

      onProgress?.({ stage: 'complete', percent: 100, message: 'Processing complete!' });
      return blob;
    } catch (error) {
      logger.error('Video processing failed:', error);
      onProgress?.({ stage: 'error', percent: 0, message: 'Processing failed' });
      return null;
    }
  }

  async trimVideo(inputFile: File | Blob | string, startTime: number, endTime: number, onProgress?: (progress: ProcessingProgress) => void): Promise<Blob | null> {
    return this.processVideo(inputFile, { trimStart: startTime, trimEnd: endTime }, onProgress);
  }

  async applyFilter(inputFile: File | Blob | string, filter: string, onProgress?: (progress: ProcessingProgress) => void): Promise<Blob | null> {
    return this.processVideo(inputFile, { filter }, onProgress);
  }

  /** Gap 28: Split video at a given time */
  async splitVideo(input: File | Blob | string, splitTime: number, onProgress?: (p: ProcessingProgress) => void) {
    if (!(await this.ensureLoaded(onProgress))) return null;
    return splitVideoImpl(this.ffmpeg!, this.getInputData.bind(this), input, splitTime, onProgress);
  }

  /** Gap 31: Apply transition between two video blobs */
  async applyTransition(clipA: Blob, clipB: Blob, type: string, dur: number, clip1Dur: number, onProgress?: (p: ProcessingProgress) => void) {
    if (!(await this.ensureLoaded(onProgress))) return null;
    return applyTransitionImpl(this.ffmpeg!, clipA, clipB, type, dur, clip1Dur, onProgress);
  }

  /** Gap 34: Insert freeze frames */
  async insertFreezeFrames(input: File | Blob | string, frames: FreezeFrame[], onProgress?: (p: ProcessingProgress) => void) {
    if (!(await this.ensureLoaded(onProgress))) return null;
    return insertFreezeFramesImpl(this.ffmpeg!, this.getInputData.bind(this), input, frames, onProgress);
  }

  /** Gap 35: Per-clip speed changes */
  async processClipSpeeds(input: File | Blob | string, clips: ClipEdit[], onProgress?: (p: ProcessingProgress) => void) {
    if (!(await this.ensureLoaded(onProgress))) return null;
    return processClipSpeedsImpl(this.ffmpeg!, this.getInputData.bind(this), input, clips, onProgress);
  }

  async generateThumbnail(inputFile: File | Blob | string, time = 0, width = 320): Promise<string | null> {
    if (!(await this.ensureLoaded())) return null;

    try {
      const inputData = await this.getInputData(inputFile);
      await this.ffmpeg!.writeFile('input.mp4', inputData);
      await this.ffmpeg!.exec(['-i', 'input.mp4', '-ss', time.toString(), '-vframes', '1', '-vf', `scale=${width}:-1`, '-f', 'image2', 'thumbnail.jpg']);
      const data = await this.ffmpeg!.readFile('thumbnail.jpg');
      const blob = new Blob([data as BlobPart], { type: 'image/jpeg' });
      await this.ffmpeg!.deleteFile('input.mp4');
      await this.ffmpeg!.deleteFile('thumbnail.jpg');
      return URL.createObjectURL(blob);
    } catch (error) {
      logger.error('Thumbnail generation failed:', error);
      return null;
    }
  }

  /** Gap #46: Extract audio track from video as MP3 */
  async extractAudio(inputFile: File | Blob | string, onProgress?: (progress: ProcessingProgress) => void): Promise<Blob | null> {
    if (!(await this.ensureLoaded(onProgress))) return null;

    try {
      onProgress?.({ stage: 'processing', percent: 0, message: 'Extracting audio...' });
      const inputData = await this.getInputData(inputFile);
      await this.ffmpeg!.writeFile('input.mp4', inputData);

      await this.ffmpeg!.exec([
        '-i', 'input.mp4',
        '-vn',           // No video
        '-acodec', 'libmp3lame',
        '-ab', '192k',   // 192kbps bitrate
        '-ar', '44100',  // 44.1kHz sample rate
        'output.mp3',
      ]);

      const data = await this.ffmpeg!.readFile('output.mp3');
      const blob = new Blob([data as BlobPart], { type: 'audio/mpeg' });

      await this.ffmpeg!.deleteFile('input.mp4');
      await this.ffmpeg!.deleteFile('output.mp3');

      onProgress?.({ stage: 'complete', percent: 100, message: 'Audio extracted!' });
      return blob;
    } catch (error) {
      logger.error('Audio extraction failed:', error);
      onProgress?.({ stage: 'error', percent: 0, message: 'Extraction failed' });
      return null;
    }
  }

  async getVideoDuration(inputFile: File | Blob): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(0);
      video.src = URL.createObjectURL(inputFile);
    });
  }

  private async getInputData(input: File | Blob | string): Promise<Uint8Array> {
    if (typeof input === 'string') {
      return await fetchFile(input);
    }
    const arrayBuffer = await input.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
