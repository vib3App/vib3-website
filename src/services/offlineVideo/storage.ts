import { VIDEOS_STORE, METADATA_STORE, MAX_STORAGE_MB, formatBytes, type OfflineVideoMetadata } from './types';
import { initializeDb, getDb, deleteFromStore } from './database';

export async function isDownloaded(videoId: string): Promise<boolean> {
  if (!getDb()) await initializeDb();
  if (!getDb()) return false;

  return new Promise((resolve) => {
    const transaction = getDb()!.transaction([METADATA_STORE], 'readonly');
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.get(videoId);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => resolve(false);
  });
}

export async function getOfflineVideo(videoId: string): Promise<string | null> {
  if (!getDb()) await initializeDb();
  if (!getDb()) return null;

  return new Promise((resolve) => {
    const transaction = getDb()!.transaction([VIDEOS_STORE], 'readonly');
    const store = transaction.objectStore(VIDEOS_STORE);
    const request = store.get(videoId);

    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        resolve(URL.createObjectURL(request.result.blob));
      } else {
        resolve(null);
      }
    };
    request.onerror = () => resolve(null);
  });
}

export async function getOfflineVideos(): Promise<OfflineVideoMetadata[]> {
  if (!getDb()) await initializeDb();
  if (!getDb()) return [];

  return new Promise((resolve) => {
    const transaction = getDb()!.transaction([METADATA_STORE], 'readonly');
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      results.sort((a: OfflineVideoMetadata, b: OfflineVideoMetadata) =>
        new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()
      );
      resolve(results);
    };
    request.onerror = () => resolve([]);
  });
}

export async function deleteOfflineVideo(videoId: string): Promise<void> {
  if (!getDb()) return;
  await Promise.all([
    deleteFromStore(VIDEOS_STORE, videoId),
    deleteFromStore(METADATA_STORE, videoId),
  ]);
}

export async function clearAllDownloads(): Promise<void> {
  if (!getDb()) return;
  const transaction = getDb()!.transaction([VIDEOS_STORE, METADATA_STORE], 'readwrite');
  transaction.objectStore(VIDEOS_STORE).clear();
  transaction.objectStore(METADATA_STORE).clear();
}

export async function getUsedStorage(): Promise<number> {
  if (!getDb()) await initializeDb();
  if (!getDb()) return 0;

  return new Promise((resolve) => {
    const transaction = getDb()!.transaction([METADATA_STORE], 'readonly');
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

export async function getStorageUsage(): Promise<{ used: string; max: string; percent: number }> {
  const usedBytes = await getUsedStorage();
  const maxBytes = MAX_STORAGE_MB * 1024 * 1024;

  return {
    used: formatBytes(usedBytes),
    max: `${MAX_STORAGE_MB} MB`,
    percent: Math.round((usedBytes / maxBytes) * 100),
  };
}

export async function freeSpace(bytesNeeded: number): Promise<void> {
  const videos = await getOfflineVideos();
  if (videos.length === 0) return;

  videos.sort((a, b) =>
    new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime()
  );

  let freedSpace = 0;
  for (const video of videos) {
    if (freedSpace >= bytesNeeded) break;
    await deleteOfflineVideo(video.videoId);
    freedSpace += video.fileSize;
  }

  console.log(`Freed ${formatBytes(freedSpace)} of storage`);
}

export function isOnline(): boolean {
  return navigator.onLine;
}
