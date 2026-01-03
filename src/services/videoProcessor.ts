/**
 * Video Processor Service
 * Client-side video processing using ffmpeg.wasm
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

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
}

interface TextOverlay {
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

class VideoProcessorService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Load FFmpeg WASM
   */
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

        this.ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]', message);
        });

        this.ffmpeg.on('progress', ({ progress }) => {
          const percent = Math.round(progress * 100);
          onProgress?.({
            stage: 'processing',
            percent,
            message: `Processing: ${percent}%`,
          });
        });

        // Load FFmpeg core from CDN
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
        await this.ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        this.isLoaded = true;
        onProgress?.({ stage: 'loading', percent: 100, message: 'Processor ready' });
        console.log('FFmpeg loaded successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
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

  /**
   * Check if FFmpeg is loaded
   */
  get loaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Process a video with edits
   */
  async processVideo(
    inputFile: File | Blob | string,
    edits: VideoEdits,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob | null> {
    if (!this.ffmpeg || !this.isLoaded) {
      const loaded = await this.load(onProgress);
      if (!loaded) return null;
    }

    const ffmpeg = this.ffmpeg!;

    try {
      onProgress?.({ stage: 'processing', percent: 0, message: 'Preparing video...' });

      // Write input file to FFmpeg filesystem
      const inputData = await this.getInputData(inputFile);
      await ffmpeg.writeFile('input.mp4', inputData);

      // Build FFmpeg command
      const args = this.buildFFmpegArgs(edits);
      console.log('FFmpeg args:', args.join(' '));

      onProgress?.({ stage: 'encoding', percent: 0, message: 'Encoding video...' });

      // Run FFmpeg
      await ffmpeg.exec(args);

      // Read output file
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });

      // Cleanup
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');

      onProgress?.({ stage: 'complete', percent: 100, message: 'Processing complete!' });

      return blob;
    } catch (error) {
      console.error('Video processing failed:', error);
      onProgress?.({ stage: 'error', percent: 0, message: 'Processing failed' });
      return null;
    }
  }

  /**
   * Trim a video
   */
  async trimVideo(
    inputFile: File | Blob | string,
    startTime: number,
    endTime: number,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob | null> {
    return this.processVideo(
      inputFile,
      { trimStart: startTime, trimEnd: endTime },
      onProgress
    );
  }

  /**
   * Apply a filter to video
   */
  async applyFilter(
    inputFile: File | Blob | string,
    filter: string,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob | null> {
    return this.processVideo(
      inputFile,
      { filter },
      onProgress
    );
  }

  /**
   * Generate a thumbnail from video at specific time
   */
  async generateThumbnail(
    inputFile: File | Blob | string,
    time: number = 0,
    width: number = 320
  ): Promise<string | null> {
    if (!this.ffmpeg || !this.isLoaded) {
      const loaded = await this.load();
      if (!loaded) return null;
    }

    const ffmpeg = this.ffmpeg!;

    try {
      const inputData = await this.getInputData(inputFile);
      await ffmpeg.writeFile('input.mp4', inputData);

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', time.toString(),
        '-vframes', '1',
        '-vf', `scale=${width}:-1`,
        '-f', 'image2',
        'thumbnail.jpg',
      ]);

      const data = await ffmpeg.readFile('thumbnail.jpg');
      const blob = new Blob([data as BlobPart], { type: 'image/jpeg' });

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('thumbnail.jpg');

      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return null;
    }
  }

  /**
   * Get video duration
   */
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

  // Private methods

  private async getInputData(input: File | Blob | string): Promise<Uint8Array> {
    if (typeof input === 'string') {
      // URL - fetch it
      return await fetchFile(input);
    } else {
      // File or Blob
      const arrayBuffer = await input.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
  }

  private buildFFmpegArgs(edits: VideoEdits): string[] {
    const args: string[] = ['-i', 'input.mp4'];

    // Trim
    if (edits.trimStart !== undefined && edits.trimStart > 0) {
      args.push('-ss', edits.trimStart.toString());
    }
    if (edits.trimEnd !== undefined) {
      const duration = edits.trimEnd - (edits.trimStart || 0);
      args.push('-t', duration.toString());
    }

    // Video filters
    const videoFilters: string[] = [];

    // Apply CSS-like filter to FFmpeg equivalent
    if (edits.filter && edits.filter !== 'none') {
      const ffmpegFilter = this.cssFilterToFFmpeg(edits.filter);
      if (ffmpegFilter) {
        videoFilters.push(ffmpegFilter);
      }
    }

    if (videoFilters.length > 0) {
      args.push('-vf', videoFilters.join(','));
    }

    // Audio volume
    if (edits.volume !== undefined && edits.volume !== 1) {
      args.push('-af', `volume=${edits.volume}`);
    }

    // Output settings
    args.push(
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      'output.mp4'
    );

    return args;
  }

  private cssFilterToFFmpeg(cssFilter: string): string | null {
    // Convert CSS filter string to FFmpeg filter
    const filters: string[] = [];

    // Parse CSS filter functions
    const grayscaleMatch = cssFilter.match(/grayscale\(([^)]+)\)/);
    if (grayscaleMatch) {
      const value = parseFloat(grayscaleMatch[1]);
      if (value > 0) {
        filters.push(`hue=s=${1 - value}`);
      }
    }

    const sepiaMatch = cssFilter.match(/sepia\(([^)]+)\)/);
    if (sepiaMatch) {
      const value = parseFloat(sepiaMatch[1]);
      if (value > 0) {
        // Sepia effect using colorbalance
        filters.push(`colorbalance=rs=${value * 0.3}:gs=${value * 0.1}:bs=${-value * 0.2}`);
      }
    }

    const contrastMatch = cssFilter.match(/contrast\(([^)]+)\)/);
    if (contrastMatch) {
      const value = parseFloat(contrastMatch[1]);
      filters.push(`eq=contrast=${value}`);
    }

    const brightnessMatch = cssFilter.match(/brightness\(([^)]+)\)/);
    if (brightnessMatch) {
      const value = parseFloat(brightnessMatch[1]);
      filters.push(`eq=brightness=${value - 1}`);
    }

    const saturateMatch = cssFilter.match(/saturate\(([^)]+)\)/);
    if (saturateMatch) {
      const value = parseFloat(saturateMatch[1]);
      filters.push(`eq=saturation=${value}`);
    }

    const hueRotateMatch = cssFilter.match(/hue-rotate\(([^)]+)deg\)/);
    if (hueRotateMatch) {
      const degrees = parseFloat(hueRotateMatch[1]);
      filters.push(`hue=h=${degrees}`);
    }

    return filters.length > 0 ? filters.join(',') : null;
  }
}

export const videoProcessor = new VideoProcessorService();
