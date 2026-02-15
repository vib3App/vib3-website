'use client';

const DB_NAME = 'vib3-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-actions';

interface PendingAction {
  id?: number;
  type: 'like' | 'comment';
  endpoint: string;
  method: 'POST' | 'DELETE';
  body?: Record<string, unknown>;
  token: string;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueOfflineAction(action: Omit<PendingAction, 'id' | 'createdAt'>): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add({ ...action, createdAt: Date.now() });
    tx.oncomplete = () => {
      resolve();
      requestBackgroundSync(action.type);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingActions(type?: string): Promise<PendingAction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const all = request.result as PendingAction[];
      resolve(type ? all.filter(a => a.type === type) : all);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingAction(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function requestBackgroundSync(tag: string): void {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) return;
  navigator.serviceWorker.ready.then((reg) => {
    (reg as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } })
      .sync.register(`sync-${tag}s`).catch(() => {});
  });
}

export async function performWithOfflineFallback(
  action: Omit<PendingAction, 'id' | 'createdAt'>,
  onlineFn: () => Promise<unknown>,
): Promise<{ queued: boolean }> {
  if (navigator.onLine) {
    try {
      await onlineFn();
      return { queued: false };
    } catch {
      // Network failed despite navigator.onLine - queue it
    }
  }
  await queueOfflineAction(action);
  return { queued: true };
}
