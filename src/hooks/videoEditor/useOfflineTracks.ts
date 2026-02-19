/**
 * Offline tracks hook (Gap #39)
 * Saves music tracks to IndexedDB for offline use.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';

export interface OfflineTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  genre: string;
  mood: string;
  downloadedAt: number;
  blobUrl?: string;
}

const DB_NAME = 'vib3_offline_tracks';
const STORE_NAME = 'tracks';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function useOfflineTracks() {
  const [downloadedTracks, setDownloadedTracks] = useState<OfflineTrack[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load downloaded tracks on mount
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = useCallback(async () => {
    try {
      setIsLoading(true);
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const tracks = request.result as OfflineTrack[];
        setDownloadedTracks(tracks.sort((a, b) => b.downloadedAt - a.downloadedAt));
        setIsLoading(false);
      };

      request.onerror = () => {
        setIsLoading(false);
      };
    } catch {
      setIsLoading(false);
    }
  }, []);

  const downloadTrack = useCallback(async (track: {
    id: string;
    title: string;
    artist: string;
    url: string;
    duration: number;
    genre: string;
    mood: string;
  }): Promise<boolean> => {
    if (downloadingIds.has(track.id)) return false;

    setDownloadingIds((prev) => new Set(prev).add(track.id));

    try {
      // Fetch audio file as blob
      const response = await fetch(track.url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();

      // Convert blob to array buffer for storage
      const arrayBuffer = await blob.arrayBuffer();

      const offlineTrack: OfflineTrack & { audioData: ArrayBuffer } = {
        ...track,
        downloadedAt: Date.now(),
        audioData: arrayBuffer,
      };

      // Store in IndexedDB
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(offlineTrack);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Update state
      setDownloadedTracks((prev) => {
        const filtered = prev.filter((t) => t.id !== track.id);
        return [{ ...track, downloadedAt: Date.now() }, ...filtered];
      });

      return true;
    } catch {
      return false;
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  }, [downloadingIds]);

  const removeTrack = useCallback(async (trackId: string): Promise<boolean> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(trackId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      setDownloadedTracks((prev) => prev.filter((t) => t.id !== trackId));
      return true;
    } catch {
      return false;
    }
  }, []);

  const isDownloaded = useCallback(
    (trackId: string): boolean => {
      return downloadedTracks.some((t) => t.id === trackId);
    },
    [downloadedTracks]
  );

  const isDownloading = useCallback(
    (trackId: string): boolean => {
      return downloadingIds.has(trackId);
    },
    [downloadingIds]
  );

  const getOfflineUrl = useCallback(async (trackId: string): Promise<string | null> => {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const request = store.get(trackId);
        request.onsuccess = () => {
          const data = request.result;
          if (data?.audioData) {
            const blob = new Blob([data.audioData], { type: 'audio/mpeg' });
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }, []);

  return {
    downloadedTracks,
    isLoading,
    downloadTrack,
    removeTrack,
    isDownloaded,
    isDownloading,
    getOfflineUrl,
  };
}
