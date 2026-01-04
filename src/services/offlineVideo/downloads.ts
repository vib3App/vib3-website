import type { Video } from '@/types';
import { MAX_STORAGE_MB, type DownloadProgress, type OfflineVideoMetadata } from './types';
import { initializeDb, saveVideoToDb, saveMetadataToDb, getDb } from './database';
import { getUsedStorage, freeSpace } from './storage';

const activeDownloads: Map<string, AbortController> = new Map();
const progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

export function isDownloading(videoId: string): boolean {
  return activeDownloads.has(videoId);
}

export function cancelDownload(videoId: string): void {
  const controller = activeDownloads.get(videoId);
  if (controller) {
    controller.abort();
    activeDownloads.delete(videoId);
    progressCallbacks.delete(videoId);
  }
}

export async function downloadVideo(
  video: Video,
  options: { quality?: string; onProgress?: (progress: DownloadProgress) => void } = {}
): Promise<boolean> {
  const { quality = '480p', onProgress } = options;

  if (!getDb()) await initializeDb();
  if (!getDb()) {
    console.error('IndexedDB not available');
    return false;
  }

  if (activeDownloads.has(video.id)) {
    console.warn('Already downloading this video');
    return false;
  }

  const downloadUrl = video.hlsUrl || video.videoUrl;
  if (!downloadUrl) {
    console.error('No download URL available');
    return false;
  }

  const actualDownloadUrl = downloadUrl.includes('.m3u8') ? video.videoUrl : downloadUrl;

  const usedBytes = await getUsedStorage();
  const maxBytes = MAX_STORAGE_MB * 1024 * 1024;
  if (usedBytes >= maxBytes) {
    await freeSpace(50 * 1024 * 1024);
  }

  const abortController = new AbortController();
  activeDownloads.set(video.id, abortController);
  if (onProgress) progressCallbacks.set(video.id, onProgress);

  try {
    console.log(`Downloading video ${video.id} at ${quality}`);

    const response = await fetch(actualDownloadUrl, { signal: abortController.signal });
    if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      if (onProgress && total > 0) {
        onProgress({ videoId: video.id, loaded, total, percent: Math.round((loaded / total) * 100) });
      }
    }

    const blob = new Blob(chunks as BlobPart[], { type: 'video/mp4' });
    await saveVideoToDb(video.id, blob);

    const metadata: OfflineVideoMetadata = {
      videoId: video.id,
      video,
      quality,
      fileSize: blob.size,
      downloadedAt: new Date().toISOString(),
    };
    await saveMetadataToDb(metadata);

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
    activeDownloads.delete(video.id);
    progressCallbacks.delete(video.id);
  }
}
