'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type HandsFreeMode = 'off' | 'voice' | 'smile';

const RECORD_WORDS = ['record', 'start', 'go'];
const STOP_WORDS = ['stop', 'done', 'end'];
const PHOTO_WORDS = ['photo', 'snap', 'cheese', 'picture'];
const FLIP_WORDS = ['flip', 'switch'];

function checkSpeechSupport() {
  if (typeof window === 'undefined') return false;
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

interface UseHandsFreeConfig {
  onRecord: () => void;
  onStop: () => void;
  onPhoto: () => void;
  onFlip: () => void;
  isRecording: boolean;
  cameraMode: 'photo' | 'video' | 'story';
}

export function useHandsFree({
  onRecord, onStop, onPhoto, onFlip, isRecording, cameraMode,
}: UseHandsFreeConfig) {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<HandsFreeMode>('off');
  const [listening, setListening] = useState(false);
  const [lastCommand, setLastCommand] = useState('');
  const speechSupported = checkSpeechSupport();

  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null);
  const commandDisplayTimer = useRef<NodeJS.Timeout | null>(null);
  const restartTimer = useRef<NodeJS.Timeout | null>(null);
  const startListeningRef = useRef<() => void>(() => {});

  const clearCommandDisplay = useCallback(() => {
    if (commandDisplayTimer.current) clearTimeout(commandDisplayTimer.current);
    commandDisplayTimer.current = setTimeout(() => setLastCommand(''), 2000);
  }, []);

  const processCommand = useCallback((words: string) => {
    const lastWord = words.split(' ').pop()?.toLowerCase().trim();
    if (!lastWord) return;

    if (RECORD_WORDS.includes(lastWord) && !isRecording && cameraMode !== 'photo') {
      setLastCommand('Record');
      onRecord();
      clearCommandDisplay();
    } else if (STOP_WORDS.includes(lastWord) && isRecording) {
      setLastCommand('Stop');
      onStop();
      clearCommandDisplay();
    } else if (PHOTO_WORDS.includes(lastWord)) {
      setLastCommand('Photo');
      onPhoto();
      clearCommandDisplay();
    } else if (FLIP_WORDS.includes(lastWord)) {
      setLastCommand('Flip');
      onFlip();
      clearCommandDisplay();
    }
  }, [isRecording, cameraMode, onRecord, onStop, onPhoto, onFlip, clearCommandDisplay]);

  const startListening = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) return;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        processCommand(last[0].transcript);
      }
    };

    recognition.onerror = () => {
      restartTimer.current = setTimeout(() => {
        if (recognitionRef.current) startListeningRef.current();
      }, 500);
    };

    recognition.onend = () => {
      setListening(false);
      restartTimer.current = setTimeout(() => {
        if (recognitionRef.current) startListeningRef.current();
      }, 300);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      // Already started or not available
    }
  }, [processCommand]);

  // Keep ref in sync
  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  const stopListening = useCallback(() => {
    if (restartTimer.current) clearTimeout(restartTimer.current);
    restartTimer.current = null;
    if (recognitionRef.current) {
      const ref = recognitionRef.current;
      recognitionRef.current = null;
      try { ref.stop(); } catch { /* ignore */ }
    }
    setListening(false);
  }, []);

  /** Cycle through modes: off -> voice -> smile -> off */
  const toggle = useCallback(() => {
    if (mode === 'off') {
      // Switch to voice mode
      if (!speechSupported) {
        // Skip voice, go to smile
        setEnabled(true);
        setMode('smile');
        return;
      }
      setEnabled(true);
      setMode('voice');
      startListening();
    } else if (mode === 'voice') {
      // Switch to smile mode
      stopListening();
      setMode('smile');
    } else {
      // Turn off
      stopListening();
      setEnabled(false);
      setMode('off');
    }
  }, [mode, speechSupported, startListening, stopListening]);

  // Smile mode state — the actual detection is in useSmileDetection hook,
  // wired through useCamera.ts. We just expose the mode flag here.
  const smileEnabled = enabled && mode === 'smile';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
      if (commandDisplayTimer.current) clearTimeout(commandDisplayTimer.current);
      if (restartTimer.current) clearTimeout(restartTimer.current);
    };
  }, []);

  return {
    enabled,
    mode,
    listening,
    lastCommand,
    speechSupported,
    smileEnabled,
    toggle,
    stopListening,
    setLastCommand,
  };
}

function createRecognition(): SpeechRecognition | null {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}
