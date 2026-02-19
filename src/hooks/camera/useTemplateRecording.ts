'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Template recording mode (Gap 4).
 * User selects a template with predefined slots (each with a duration).
 * Camera records into each slot sequentially, advancing automatically.
 */

export interface TemplateSlot {
  id: string;
  label: string;
  duration: number; // seconds
}

export interface RecordingTemplate {
  id: string;
  name: string;
  description: string;
  slots: TemplateSlot[];
  thumbnail?: string;
}

export const BUILT_IN_TEMPLATES: RecordingTemplate[] = [
  {
    id: 'intro-body-outro',
    name: 'Intro / Body / Outro',
    description: '3-part structure: 3s intro, 10s body, 3s outro',
    slots: [
      { id: 'intro', label: 'Intro', duration: 3 },
      { id: 'body', label: 'Body', duration: 10 },
      { id: 'outro', label: 'Outro', duration: 3 },
    ],
  },
  {
    id: 'quick-3',
    name: 'Quick Cuts',
    description: '3 rapid 5-second clips',
    slots: [
      { id: 'clip1', label: 'Clip 1', duration: 5 },
      { id: 'clip2', label: 'Clip 2', duration: 5 },
      { id: 'clip3', label: 'Clip 3', duration: 5 },
    ],
  },
  {
    id: 'before-after',
    name: 'Before & After',
    description: '7s before, 7s after',
    slots: [
      { id: 'before', label: 'Before', duration: 7 },
      { id: 'after', label: 'After', duration: 7 },
    ],
  },
  {
    id: 'countdown-5',
    name: '5-Part Countdown',
    description: 'Five 3-second segments',
    slots: [
      { id: 's5', label: '5', duration: 3 },
      { id: 's4', label: '4', duration: 3 },
      { id: 's3', label: '3', duration: 3 },
      { id: 's2', label: '2', duration: 3 },
      { id: 's1', label: '1', duration: 3 },
    ],
  },
  {
    id: 'story-arc',
    name: 'Story Arc',
    description: 'Setup, Conflict, Resolution',
    slots: [
      { id: 'setup', label: 'Setup', duration: 5 },
      { id: 'conflict', label: 'Conflict', duration: 8 },
      { id: 'resolution', label: 'Resolution', duration: 5 },
    ],
  },
];

interface SlotRecording {
  slotId: string;
  blob: Blob | null;
  recorded: boolean;
}

export type TemplateState = 'selecting' | 'ready' | 'recording' | 'slot-complete' | 'all-complete';

export function useTemplateRecording() {
  const [selectedTemplate, setSelectedTemplate] = useState<RecordingTemplate | null>(null);
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [templateState, setTemplateState] = useState<TemplateState>('selecting');
  const [slotRecordings, setSlotRecordings] = useState<SlotRecording[]>([]);
  const [slotTimeRemaining, setSlotTimeRemaining] = useState(0);

  const slotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectTemplate = useCallback((template: RecordingTemplate) => {
    setSelectedTemplate(template);
    setCurrentSlotIndex(0);
    setTemplateState('ready');
    setSlotRecordings(
      template.slots.map((s) => ({ slotId: s.id, blob: null, recorded: false })),
    );
    setSlotTimeRemaining(template.slots[0]?.duration ?? 0);
  }, []);

  const startSlotRecording = useCallback(() => {
    if (!selectedTemplate) return;
    const slot = selectedTemplate.slots[currentSlotIndex];
    if (!slot) return;

    setTemplateState('recording');
    setSlotTimeRemaining(slot.duration);

    slotTimerRef.current = setInterval(() => {
      setSlotTimeRemaining((prev) => {
        if (prev <= 1) {
          if (slotTimerRef.current) clearInterval(slotTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [selectedTemplate, currentSlotIndex]);

  /** Called when the recording for the current slot completes */
  const completeSlotRecording = useCallback((blob: Blob) => {
    if (slotTimerRef.current) clearInterval(slotTimerRef.current);

    setSlotRecordings((prev) => {
      const updated = [...prev];
      if (updated[currentSlotIndex]) {
        updated[currentSlotIndex] = {
          ...updated[currentSlotIndex],
          blob,
          recorded: true,
        };
      }
      return updated;
    });

    if (selectedTemplate && currentSlotIndex >= selectedTemplate.slots.length - 1) {
      setTemplateState('all-complete');
    } else {
      setTemplateState('slot-complete');
    }
  }, [currentSlotIndex, selectedTemplate]);

  const advanceToNextSlot = useCallback(() => {
    if (!selectedTemplate) return;
    const nextIndex = currentSlotIndex + 1;
    if (nextIndex >= selectedTemplate.slots.length) {
      setTemplateState('all-complete');
      return;
    }
    setCurrentSlotIndex(nextIndex);
    setSlotTimeRemaining(selectedTemplate.slots[nextIndex].duration);
    setTemplateState('ready');
  }, [selectedTemplate, currentSlotIndex]);

  const retakeCurrentSlot = useCallback(() => {
    setSlotRecordings((prev) => {
      const updated = [...prev];
      if (updated[currentSlotIndex]) {
        updated[currentSlotIndex] = {
          ...updated[currentSlotIndex],
          blob: null,
          recorded: false,
        };
      }
      return updated;
    });
    setTemplateState('ready');
    if (selectedTemplate) {
      setSlotTimeRemaining(selectedTemplate.slots[currentSlotIndex]?.duration ?? 0);
    }
  }, [currentSlotIndex, selectedTemplate]);

  const resetTemplate = useCallback(() => {
    if (slotTimerRef.current) clearInterval(slotTimerRef.current);
    setSelectedTemplate(null);
    setCurrentSlotIndex(0);
    setTemplateState('selecting');
    setSlotRecordings([]);
    setSlotTimeRemaining(0);
  }, []);

  const getAllBlobs = useCallback((): Blob[] => {
    return slotRecordings
      .filter((s) => s.blob !== null)
      .map((s) => s.blob!);
  }, [slotRecordings]);

  const currentSlot = selectedTemplate?.slots[currentSlotIndex] ?? null;
  const totalDuration = selectedTemplate?.slots.reduce((a, s) => a + s.duration, 0) ?? 0;
  const completedSlots = slotRecordings.filter((s) => s.recorded).length;
  const isActive = selectedTemplate !== null && templateState !== 'selecting';

  return {
    // State
    selectedTemplate,
    currentSlotIndex,
    currentSlot,
    templateState,
    slotRecordings,
    slotTimeRemaining,
    totalDuration,
    completedSlots,
    isActive,
    // Actions
    selectTemplate,
    startSlotRecording,
    completeSlotRecording,
    advanceToNextSlot,
    retakeCurrentSlot,
    resetTemplate,
    getAllBlobs,
  };
}
