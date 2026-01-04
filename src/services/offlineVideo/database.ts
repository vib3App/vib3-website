import { DB_NAME, DB_VERSION, VIDEOS_STORE, METADATA_STORE, type OfflineVideoMetadata } from './types';

let db: IDBDatabase | null = null;
let isInitialized = false;

export async function initializeDb(): Promise<boolean> {
  if (isInitialized && db) return true;

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
      db = (event.target as IDBOpenDBRequest).result;
      isInitialized = true;
      console.log('Offline video database initialized');
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(VIDEOS_STORE)) {
        database.createObjectStore(VIDEOS_STORE, { keyPath: 'videoId' });
      }

      if (!database.objectStoreNames.contains(METADATA_STORE)) {
        const metaStore = database.createObjectStore(METADATA_STORE, { keyPath: 'videoId' });
        metaStore.createIndex('downloadedAt', 'downloadedAt');
      }
    };
  });
}

export function getDb(): IDBDatabase | null {
  return db;
}

export async function saveVideoToDb(videoId: string, blob: Blob): Promise<void> {
  if (!db) await initializeDb();
  if (!db) throw new Error('Database not available');

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([VIDEOS_STORE], 'readwrite');
    const store = transaction.objectStore(VIDEOS_STORE);
    const request = store.put({ videoId, blob });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function saveMetadataToDb(metadata: OfflineVideoMetadata): Promise<void> {
  if (!db) await initializeDb();
  if (!db) throw new Error('Database not available');

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([METADATA_STORE], 'readwrite');
    const store = transaction.objectStore(METADATA_STORE);
    const request = store.put(metadata);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFromStore(storeName: string, videoId: string): Promise<void> {
  if (!db) return;

  return new Promise((resolve) => {
    const transaction = db!.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(videoId);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => resolve();
  });
}
