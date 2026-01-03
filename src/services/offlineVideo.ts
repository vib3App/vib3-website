/**
 * Offline Video Service
 * Handles saving videos for offline viewing using IndexedDB
 */

import type { Video } from '@/types';

const DB_NAME = 'vib3_offline';
const DB_VERSION = 1;
const VIDEOS_STORE = 'videos';
const METADATA_STORE = 'metadata';
const MAX_STORAGE_MB = 500; // 500MB limit for offline videos

interface OfflineVideoMetadata {
  videoId: string;
  video: Video;
  quality: string;
  fileSize: number;
  downloadedAt: string;
  lastPlayedAt?: string;
}

interface DownloadProgress {
  videoId: string;
  loaded: number;
  total: number;
  percent: number;
}

class OfflineVideoService {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private activeDownloads: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

  /**
   * Initialize the IndexedDB database
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized && this.db) return true;

    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported');
        resolve(false);
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB');
        resolve(false);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.isInitialized = true;
        console.log('Offline video database initialized');
        resolve(true);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for video blobs
        if (!db.objectStoreNames.contains(VIDEOS_STORE)) {
          db.createObjectStore(VIDEOS_STORE, { keyPath: 'videoId' });
        }

        // Store for metadata
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          const metaStore = db.createObjectStore(METADATA_STORE, { keyPath: 'videoId' });
          metaStore.createIndex('downloadedAt', 'downloadedAt');
        }
      };
    });
  }

  /**
   * Check if a video is saved offline
   */
  async isDownloaded(videoId: string): Promise<boolean> {
    if (!this.db) await this.initialize();
    if (!this.db) return false;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.get(videoId);

      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
  }

  /**
   * Check if a video is currently downloading
   */
  isDownloading(videoId: string): boolean {
    return this.activeDownloads.has(videoId);
  }

  /**
   * Download and save a video for offline viewing
   */
  async downloadVideo(
    video: Video,
    options: {
      quality?: string;
      onProgress?: (progress: DownloadProgress) => void;
    } = {}
  ): Promise<boolean> {
    const { quality = '480p', onProgress } = options;

    if (!this.db) await this.initialize();
    if (!this.db) {
      console.error('IndexedDB not available');
      return false;
    }

    // Check if already downloading
    if (this.activeDownloads.has(video.id)) {
      console.warn('Already downloading this video');
      return false;
    }

    // Get download URL (use HLS URL or fallback to video URL)
    const downloadUrl = video.hlsUrl || video.videoUrl;
    if (!downloadUrl) {
      console.error('No download URL available');
      return false;
    }

    // For HLS streams, we can't easily download - use the video URL instead
    const actualDownloadUrl = downloadUrl.includes('.m3u8') ? video.videoUrl : downloadUrl;

    // Check storage usage
    const usedBytes = await this.getUsedStorage();
    const maxBytes = MAX_STORAGE_MB * 1024 * 1024;
    if (usedBytes >= maxBytes) {
      // Try to free space by removing oldest videos
      await this.freeSpace(50 * 1024 * 1024); // Free 50MB
    }

    const abortController = new AbortController();
    this.activeDownloads.set(video.id, abortController);
    if (onProgress) {
      this.progressCallbacks.set(video.id, onProgress);
    }

    try {
      console.log(`Downloading video ${video.id} at ${quality}`);

      const response = await fetch(actualDownloadUrl, {
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
            videoId: video.id,
            loaded,
            total,
            percent: Math.round((loaded / total) * 100),
          });
        }
      }

      // Combine chunks into blob
      const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });

      // Save to IndexedDB
      await this.saveVideoToDb(video.id, blob);

      // Save metadata
      const metadata: OfflineVideoMetadata = {
        videoId: video.id,
        video,
        quality,
        fileSize: blob.size,
        downloadedAt: new Date().toISOString(),
      };
      await this.saveMetadataToDb(metadata);

      console.log(`Successfully saved video ${video.id} for offline viewing`);
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Download cancelled');
        return false;
      }
      console.error('Download failed:', error);
      return false;
    } finally {
      this.activeDownloads.delete(video.id);
      this.progressCallbacks.delete(video.id);
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
      this.progressCallbacks.delete(videoId);
    }
  }

  /**
   * Get offline video blob for playback
   */
  async getOfflineVideo(videoId: string): Promise<string | null> {
    if (!this.db) await this.initialize();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readonly');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.get(videoId);

      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          const url = URL.createObjectURL(request.result.blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  /**
   * Get all offline videos with metadata
   */
  async getOfflineVideos(): Promise<OfflineVideoMetadata[]> {
    if (!this.db) await this.initialize();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        // Sort by download date (newest first)
        results.sort((a: OfflineVideoMetadata, b: OfflineVideoMetadata) =>
          new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
        );
        resolve(results);
      };
      request.onerror = () => resolve([]);
    });
  }

  /**
   * Delete an offline video
   */
  async deleteOfflineVideo(videoId: string): Promise<void> {
    if (!this.db) return;

    await Promise.all([
      this.deleteFromStore(VIDEOS_STORE, videoId),
      this.deleteFromStore(METADATA_STORE, videoId),
    ]);
  }

  /**
   * Delete all offline videos
   */
  async clearAllDownloads(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([VIDEOS_STORE, METADATA_STORE], 'readwrite');
    transaction.objectStore(VIDEOS_STORE).clear();
    transaction.objectStore(METADATA_STORE).clear();
  }

  /**
   * Get total storage used
   */
  async getUsedStorage(): Promise<number> {
    if (!this.db) await this.initialize();
    if (!this.db) return 0;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readonly');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const total = (request.result || []).reduce(
          (sum: number, meta: OfflineVideoMetadata) => sum + (meta.fileSize || 0),
          0
        );
        resolve(total);
      };
      request.onerror = () => resolve(0);
    });
  }

  /**
   * Get formatted storage usage
   */
  async getStorageUsage(): Promise<{ used: string; max: string; percent: number }> {
    const usedBytes = await this.getUsedStorage();
    const maxBytes = MAX_STORAGE_MB * 1024 * 1024;

    return {
      used: this.formatBytes(usedBytes),
      max: `${MAX_STORAGE_MB} MB`,
      percent: Math.round((usedBytes / maxBytes) * 100),
    };
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Private methods

  private async saveVideoToDb(videoId: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VIDEOS_STORE], 'readwrite');
      const store = transaction.objectStore(VIDEOS_STORE);
      const request = store.put({ videoId, blob });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async saveMetadataToDb(metadata: OfflineVideoMetadata): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([METADATA_STORE], 'readwrite');
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.put(metadata);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, videoId: string): Promise<void> {
    return new Promise((resolve) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      store.delete(videoId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    });
  }

  private async freeSpace(bytesNeeded: number): Promise<void> {
    const videos = await this.getOfflineVideos();
    if (videos.length === 0) return;

    // Sort by download date (oldest first)
    videos.sort((a, b) =>
      new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime()
    );

    let freedSpace = 0;
    for (const video of videos) {
      if (freedSpace >= bytesNeeded) break;

      await this.deleteOfflineVideo(video.videoId);
      freedSpace += video.fileSize;
    }

    console.log(`Freed ${this.formatBytes(freedSpace)} of storage`);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const offlineVideoService = new OfflineVideoService();
