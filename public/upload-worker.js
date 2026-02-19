/**
 * Gap #77: Upload Service Worker
 * Continues TUS uploads even when the tab is closed.
 * Stores upload state in IndexedDB for resume capability.
 */

const DB_NAME = 'vib3-uploads';
const DB_VERSION = 1;
const STORE_NAME = 'active-uploads';
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

function openDB() {
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

async function getUpload(uploadId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(uploadId);
    request.onsuccess = () => { db.close(); resolve(request.result); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

async function updateUpload(data) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).put({ ...data, lastUpdated: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function removeUpload(uploadId) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(uploadId);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/**
 * Continue a TUS upload from the current offset.
 * Uses fetch with keepalive for small final chunks.
 */
async function continueUpload(uploadState, chunk) {
  try {
    const useKeepalive = chunk.size < 64 * 1024; // keepalive limit ~64KB
    const response = await fetch(uploadState.uploadUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/offset+octet-stream',
        'Upload-Offset': String(uploadState.offset),
        'Tus-Resumable': '1.0.0',
      },
      body: chunk,
      keepalive: useKeepalive,
    });

    if (response.ok) {
      const newOffset = parseInt(response.headers.get('Upload-Offset') || '0', 10);
      await updateUpload({ ...uploadState, offset: newOffset });

      // Notify all clients about progress
      const clients = await self.clients.matchAll();
      for (const client of clients) {
        client.postMessage({
          type: 'UPLOAD_PROGRESS',
          uploadId: uploadState.uploadId,
          offset: newOffset,
          total: uploadState.fileSize,
        });
      }

      if (newOffset >= uploadState.fileSize) {
        await removeUpload(uploadState.uploadId);
        for (const client of clients) {
          client.postMessage({
            type: 'UPLOAD_COMPLETE',
            uploadId: uploadState.uploadId,
          });
        }
      }

      return true;
    }
    return false;
  } catch (error) {
    console.error('[UploadWorker] Upload chunk failed:', error);
    return false;
  }
}

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
  const { type, data } = event.data || {};

  switch (type) {
    case 'REGISTER_UPLOAD': {
      await updateUpload(data);
      break;
    }
    case 'UPLOAD_CHUNK': {
      const state = await getUpload(data.uploadId);
      if (state) {
        await continueUpload(state, data.chunk);
      }
      break;
    }
    case 'GET_STATUS': {
      const state = await getUpload(data.uploadId);
      event.source.postMessage({
        type: 'UPLOAD_STATUS',
        uploadId: data.uploadId,
        state: state || null,
      });
      break;
    }
    case 'CANCEL_UPLOAD': {
      await removeUpload(data.uploadId);
      break;
    }
  }
});
