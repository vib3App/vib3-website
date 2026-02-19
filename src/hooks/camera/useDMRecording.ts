'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * DM recording mode (Gap 6).
 * When URL has ?dmMode=true, after recording the video blob
 * is saved to sessionStorage and the user is navigated to
 * /messages/new to send as a video message.
 */

export interface DMRecordingState {
  isDMMode: boolean;
  recipientId: string | null;
}

export function useDMRecording() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<DMRecordingState>({
    isDMMode: false,
    recipientId: null,
  });

  // Parse URL params on mount
  useEffect(() => {
    const dmMode = searchParams.get('dmMode');
    const recipientId = searchParams.get('recipientId');

    if (dmMode === 'true') {
      setState({
        isDMMode: true,
        recipientId: recipientId ?? null,
      });
    }
  }, [searchParams]);

  /**
   * After recording is complete, save the video blob URL
   * to sessionStorage and navigate to the messages new page.
   */
  const sendAsDM = useCallback((previewUrl: string) => {
    if (!state.isDMMode) return;

    sessionStorage.setItem('dmVideoUrl', previewUrl);

    const params = new URLSearchParams();
    params.set('type', 'video');
    if (state.recipientId) {
      params.set('to', state.recipientId);
    }

    router.push(`/messages/new?${params.toString()}`);
  }, [state, router]);

  /** Cancel DM mode and return to normal camera */
  const cancelDMMode = useCallback(() => {
    setState({ isDMMode: false, recipientId: null });
    sessionStorage.removeItem('dmVideoUrl');
  }, []);

  return {
    isDMMode: state.isDMMode,
    recipientId: state.recipientId,
    sendAsDM,
    cancelDMMode,
  };
}
