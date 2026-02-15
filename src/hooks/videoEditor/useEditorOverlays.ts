'use client';

import { useState, useCallback } from 'react';
import type { TextOverlay, StickerOverlay } from './types';

export function useEditorOverlays() {
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  const [stickers, setStickers] = useState<StickerOverlay[]>([]);

  const addText = useCallback(() => {
    if (!newText.trim()) return;
    setTexts(prev => [...prev, {
      id: Date.now().toString(),
      text: newText,
      x: 50,
      y: 50,
      color: '#ffffff',
      fontSize: 24,
    }]);
    setNewText('');
    setShowTextInput(false);
  }, [newText]);

  const removeText = useCallback((id: string) => {
    setTexts(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTextPosition = useCallback((id: string, x: number, y: number) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  }, []);

  const addSticker = useCallback((emoji: string) => {
    setStickers(prev => [...prev, {
      id: Date.now().toString(),
      emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
    }]);
  }, []);

  const removeSticker = useCallback((id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateStickerPosition = useCallback((id: string, x: number, y: number) => {
    setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);

  return {
    texts, showTextInput, setShowTextInput, newText, setNewText,
    stickers, addText, removeText, updateTextPosition,
    addSticker, removeSticker, updateStickerPosition,
  };
}
