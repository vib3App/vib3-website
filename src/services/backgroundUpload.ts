/**
 * Background Upload Service - Gap #40
 * Persists upload state to IndexedDB and resumes uploads when tab returns
 * Enhances TusUploadManager with background persistence
 */

import { logger } from '@/utils/logger';

const DB_NAME = 'vib3-uploads';
const DB_VERSION = 1;
const STORE_NAME = 'active-uploads';

interface PersistedUpload {
  uploadId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  offset: number;
  uploadUrl: string;
  createdAt: number;
  lastUpdated: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'uploadId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const backgroundUploadService = {
  /** Save upload state to IndexedDB */
  async persistState(state: PersistedUpload): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ ...state, lastUpdated: Date.now() });
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (err) {
      logger.error('Failed to persist upload state:', err);
    }
  },

  /** Get all persisted uploads that can be resumed */
  async getPendingUploads(): Promise<PersistedUpload[]> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          db.close();
          // Filter out uploads older than 24 hours
          const cutoff = Date.now() - 24 * 60 * 60 * 1000;
          const valid = (request.result as PersistedUpload[]).filter(
            u => u.lastUpdated > cutoff
          );
          resolve(valid);
        };
        request.onerror = () => { db.close(); reject(request.error); };
      });
    } catch (err) {
      logger.error('Failed to get pending uploads:', err);
      return [];
    }
  },

  /** Remove completed/cancelled upload from persistence */
  async removeUpload(uploadId: string): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(uploadId);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch (err) {
      logger.error('Failed to remove upload:', err);
    }
  },

  /** Clean up stale uploads */
  async cleanup(): Promise<void> {
    const uploads = await this.getPendingUploads();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const upload of uploads) {
      if (upload.lastUpdated < cutoff) {
        await this.removeUpload(upload.uploadId);
      }
    }
  },

  /** Register visibility change listener to detect tab backgrounding */
  registerVisibilityHandler(
    onHidden: () => void,
    onVisible: () => void
  ): () => void {
    const handler = () => {
      if (document.visibilityState === 'hidden') {
        onHidden();
      } else if (document.visibilityState === 'visible') {
        onVisible();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  },

  /** Request keepalive for background upload continuation */
  async sendKeepAlive(uploadUrl: string, chunk: Blob, offset: number): Promise<boolean> {
    try {
      // Use keepalive flag to continue upload even when page is being unloaded
      const response = await fetch(uploadUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/offset+octet-stream',
          'Upload-Offset': String(offset),
          'Tus-Resumable': '1.0.0',
        },
        body: chunk,
        keepalive: true,
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
