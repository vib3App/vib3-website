/**
 * Video Download Service
 * Handles downloading videos to the user's device
 */

export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface DownloadOptions {
  onProgress?: (progress: DownloadProgress) => void;
  filename?: string;
}

class VideoDownloadService {
  private activeDownloads: Map<string, AbortController> = new Map();

  /**
   * Download a video from URL
   */
  async downloadVideo(
    videoUrl: string,
    videoId: string,
    options: DownloadOptions = {}
  ): Promise<boolean> {
    const { onProgress, filename } = options;

    // Check if already downloading
    if (this.activeDownloads.has(videoId)) {
      // Already downloading
      return false;
    }

    const abortController = new AbortController();
    this.activeDownloads.set(videoId, abortController);

    try {
      const response = await fetch(videoUrl, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (onProgress && total > 0) {
          onProgress({
            loaded,
            total,
            percent: Math.round((loaded / total) * 100),
          });
        }
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `vib3-video-${videoId}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // Download cancelled
        return false;
      }
      console.error('Download failed:', error);
      throw error;
    } finally {
      this.activeDownloads.delete(videoId);
    }
  }

  /**
   * Cancel an active download
   */
  cancelDownload(videoId: string): void {
    const controller = this.activeDownloads.get(videoId);
    if (controller) {
      controller.abort();
      this.activeDownloads.delete(videoId);
    }
  }

  /**
   * Check if a download is in progress
   */
  isDownloading(videoId: string): boolean {
    return this.activeDownloads.has(videoId);
  }

  /**
   * Quick download without progress tracking
   * Uses browser's native download capability
   */
  async quickDownload(videoUrl: string, videoId: string, filename?: string): Promise<void> {
    // For same-origin or CORS-enabled videos, use direct link
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = filename || `vib3-video-${videoId}.mp4`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    // Try to trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

export const videoDownloadService = new VideoDownloadService();
