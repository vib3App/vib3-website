'use client';

import { useCallback, useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

const DB_NAME = 'vib3_editor_drafts';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';
const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

export interface EditorDraft {
  id: string;
  videoUrl: string;
  filter: number;
  volume: number;
  trimStart: number;
  trimEnd: number;
  speed: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  cropAspect: string | null;
  opacity: number;
  blendMode: string;
  reversed: boolean;
  selectedTransition: string;
  noiseReduction: number;
  updatedAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

async function saveDraft(draft: EditorDraft): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(draft);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadDraft(id: string): Promise<EditorDraft | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

async function deleteDraft(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function useDraftPersistence(videoUrl: string | null) {
  const draftIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const getStateRef = useRef<(() => Omit<EditorDraft, 'id' | 'videoUrl' | 'updatedAt'>) | null>(null);

  // Generate a stable draft ID from the video URL
  useEffect(() => {
    if (videoUrl) {
      // Use a simple hash of the URL
      let hash = 0;
      for (let i = 0; i < videoUrl.length; i++) {
        hash = ((hash << 5) - hash + videoUrl.charCodeAt(i)) | 0;
      }
      draftIdRef.current = `draft-${Math.abs(hash).toString(36)}`;
    }
  }, [videoUrl]);

  const save = useCallback(async () => {
    if (!draftIdRef.current || !videoUrl || !getStateRef.current) return;
    try {
      const state = getStateRef.current();
      await saveDraft({
        id: draftIdRef.current,
        videoUrl,
        ...state,
        updatedAt: Date.now(),
      });
    } catch (err) {
      logger.error('Failed to save editor draft:', err);
    }
  }, [videoUrl]);

  const load = useCallback(async (): Promise<EditorDraft | null> => {
    if (!draftIdRef.current) return null;
    try {
      return await loadDraft(draftIdRef.current);
    } catch (err) {
      logger.error('Failed to load editor draft:', err);
      return null;
    }
  }, []);

  const discard = useCallback(async () => {
    if (!draftIdRef.current) return;
    try {
      await deleteDraft(draftIdRef.current);
    } catch (err) {
      logger.error('Failed to delete editor draft:', err);
    }
  }, []);

  const registerStateGetter = useCallback((getter: () => Omit<EditorDraft, 'id' | 'videoUrl' | 'updatedAt'>) => {
    getStateRef.current = getter;
  }, []);

  // Auto-save every 5 seconds
  useEffect(() => {
    if (!videoUrl) return;
    intervalRef.current = setInterval(save, AUTO_SAVE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoUrl, save]);

  // Save on page leave
  useEffect(() => {
    const handleBeforeUnload = () => { save(); };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [save]);

  return { save, load, discard, registerStateGetter };
}
