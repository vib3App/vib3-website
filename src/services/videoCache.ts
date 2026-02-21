/**
 * GAP-17: Video Cache Service
 * Client-side interface for offline video caching via Service Worker.
 * Mirrors Flutter's VideoCacheService functionality.
 */

export interface CachedVideoMeta {
  videoId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  cachedAt: string;
  size: number;
}

class VideoCacheService {
  private listeners = new Map<string, Set<(cached: boolean) => void>>();

  constructor() {
    if (typeof window !== 'undefined') {
      navigator.serviceWorker?.addEventListener('message', (event) => {
        if (event.data?.type === 'VIDEO_CACHED') {
          this.notify(event.data.videoId, true);
        }
        if (event.data?.type === 'VIDEO_REMOVED') {
          this.notify(event.data.videoId, false);
        }
      });
    }
  }

  /** Cache a video for offline playback */
  async cacheVideo(videoId: string, videoUrl: string, thumbnailUrl?: string, caption?: string): Promise<void> {
    const reg = await navigator.serviceWorker?.ready;
    reg?.active?.postMessage({
      type: 'CACHE_VIDEO',
      videoId,
      videoUrl,
      thumbnailUrl,
      caption,
    });
  }

  /** Remove a cached video */
  async removeVideo(videoId: string, videoUrl?: string): Promise<void> {
    const reg = await navigator.serviceWorker?.ready;
    reg?.active?.postMessage({
      type: 'REMOVE_VIDEO',
      videoId,
      videoUrl,
    });
  }

  /** Check if a video is cached */
  async isCached(videoUrl: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    try {
      const cache = await caches.open('vib3-video-cache-v1');
      const response = await cache.match(videoUrl);
      return !!response;
    } catch {
      return false;
    }
  }

  /** Get all cached video metadata */
  async getCachedVideos(): Promise<CachedVideoMeta[]> {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        if (event.data?.type === 'CACHED_VIDEOS') {
          resolve(event.data.videos || []);
        }
      };

      navigator.serviceWorker?.ready.then((reg) => {
        reg.active?.postMessage({ type: 'GET_CACHED_VIDEOS' }, [channel.port2]);
      });

      // Timeout fallback
      setTimeout(() => resolve([]), 3000);
    });
  }

  /** Subscribe to cache status changes for a video */
  onCacheChange(videoId: string, callback: (cached: boolean) => void): () => void {
    if (!this.listeners.has(videoId)) {
      this.listeners.set(videoId, new Set());
    }
    this.listeners.get(videoId)!.add(callback);
    return () => {
      this.listeners.get(videoId)?.delete(callback);
    };
  }

  private notify(videoId: string, cached: boolean) {
    this.listeners.get(videoId)?.forEach((cb) => cb(cached));
  }
}

export const videoCacheService = new VideoCacheService();
