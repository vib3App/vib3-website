'use client';

import { useState, useCallback, useRef } from 'react';
import type { TextOverlay, StickerOverlay } from './types';

const MAX_UNDO = 30;

export interface EditorSnapshot {
  selectedFilter: number;
  volume: number;
  trimStart: number;
  trimEnd: number;
  texts: TextOverlay[];
  stickers: StickerOverlay[];
  speed: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  cropAspect: string | null;
}

export function useEditorHistory() {
  const [undoStack, setUndoStack] = useState<EditorSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditorSnapshot[]>([]);
  const isRestoringRef = useRef(false);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const saveSnapshot = useCallback((snapshot: EditorSnapshot) => {
    if (isRestoringRef.current) return;
    setUndoStack(prev => {
      const next = [...prev, snapshot];
      if (next.length > MAX_UNDO) next.shift();
      return next;
    });
    setRedoStack([]);
  }, []);

  const undo = useCallback((currentState: EditorSnapshot): EditorSnapshot | null => {
    if (undoStack.length === 0) return null;
    isRestoringRef.current = true;

    const prev = undoStack[undoStack.length - 1];
    setUndoStack(s => s.slice(0, -1));
    setRedoStack(s => [...s, currentState]);

    isRestoringRef.current = false;
    return prev;
  }, [undoStack]);

  const redo = useCallback((currentState: EditorSnapshot): EditorSnapshot | null => {
    if (redoStack.length === 0) return null;
    isRestoringRef.current = true;

    const next = redoStack[redoStack.length - 1];
    setRedoStack(s => s.slice(0, -1));
    setUndoStack(s => [...s, currentState]);

    isRestoringRef.current = false;
    return next;
  }, [redoStack]);

  return { canUndo, canRedo, saveSnapshot, undo, redo };
}
