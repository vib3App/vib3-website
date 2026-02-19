'use client';

import { useState, useRef, useCallback } from 'react';

export type GridLayout = '1x1' | '2x1' | '2x2' | '1x3';

interface GridSlot {
  index: number;
  clipUrl: string | null;
  clipBlob: Blob | null;
}

function getGridDimensions(layout: GridLayout): { cols: number; rows: number; total: number } {
  switch (layout) {
    case '1x1': return { cols: 1, rows: 1, total: 1 };
    case '2x1': return { cols: 2, rows: 1, total: 2 };
    case '2x2': return { cols: 2, rows: 2, total: 4 };
    case '1x3': return { cols: 1, rows: 3, total: 3 };
  }
}

export function useGridRecording() {
  const [gridLayout, setGridLayout] = useState<GridLayout>('1x1');
  const [isGridMode, setIsGridMode] = useState(false);
  const [slots, setSlots] = useState<GridSlot[]>([]);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [compositeUrl, setCompositeUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions = getGridDimensions(gridLayout);

  const initGrid = useCallback((layout: GridLayout) => {
    const dims = getGridDimensions(layout);
    const newSlots: GridSlot[] = Array.from({ length: dims.total }, (_, i) => ({
      index: i,
      clipUrl: null,
      clipBlob: null,
    }));
    setGridLayout(layout);
    setSlots(newSlots);
    setActiveSlotIndex(0);
    setIsGridMode(layout !== '1x1');
    setCompositeUrl(null);
  }, []);

  const assignClip = useCallback((slotIndex: number, clipUrl: string, clipBlob: Blob) => {
    setSlots(prev => prev.map((s, i) =>
      i === slotIndex ? { ...s, clipUrl, clipBlob } : s
    ));
    // Advance to next empty slot
    setActiveSlotIndex(prev => {
      const next = prev + 1;
      return next < dimensions.total ? next : prev;
    });
  }, [dimensions.total]);

  const clearSlot = useCallback((slotIndex: number) => {
    setSlots(prev => prev.map((s, i) => {
      if (i === slotIndex) {
        if (s.clipUrl) URL.revokeObjectURL(s.clipUrl);
        return { ...s, clipUrl: null, clipBlob: null };
      }
      return s;
    }));
  }, []);

  const filledCount = slots.filter(s => s.clipUrl !== null).length;
  const isComplete = filledCount === dimensions.total;

  /** Composite all grid clips into a single canvas for export */
  const renderComposite = useCallback(async (): Promise<Blob | null> => {
    if (!isComplete) return null;

    const { cols, rows } = dimensions;
    const cellW = 540;
    const cellH = 960;
    const canvas = document.createElement('canvas');
    canvas.width = cellW * cols;
    canvas.height = cellH * rows;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw first frame of each clip
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.clipUrl) continue;

      const col = i % cols;
      const row = Math.floor(i / cols);

      const video = document.createElement('video');
      video.src = slot.clipUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => {
          video.currentTime = 0.1;
        };
        video.onseeked = () => {
          ctx.drawImage(video, col * cellW, row * cellH, cellW, cellH);
          resolve();
        };
        video.onerror = () => resolve();
      });
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.92);
    });
  }, [isComplete, dimensions, slots]);

  const resetGrid = useCallback(() => {
    slots.forEach(s => { if (s.clipUrl) URL.revokeObjectURL(s.clipUrl); });
    if (compositeUrl) URL.revokeObjectURL(compositeUrl);
    setSlots([]);
    setActiveSlotIndex(0);
    setIsGridMode(false);
    setGridLayout('1x1');
    setCompositeUrl(null);
  }, [slots, compositeUrl]);

  return {
    gridLayout,
    isGridMode,
    slots,
    activeSlotIndex,
    setActiveSlotIndex,
    dimensions,
    filledCount,
    isComplete,
    compositeUrl,
    canvasRef,
    initGrid,
    assignClip,
    clearSlot,
    renderComposite,
    resetGrid,
  };
}
