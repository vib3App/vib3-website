'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

/**
 * Clip-only mode (Gap 7).
 * When URL has ?clipOnly=true, after recording the clip
 * is saved to sessionStorage and navigation goes back to /edit
 * to add to an existing project timeline.
 */

export interface ClipOnlyState {
  isClipOnly: boolean;
  /** Optional project ID to return to */
  projectId: string | null;
}

export function useClipOnlyMode() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<ClipOnlyState>({
    isClipOnly: false,
    projectId: null,
  });

  // Parse URL params on mount
  useEffect(() => {
    const clipOnly = searchParams.get('clipOnly');
    const projectId = searchParams.get('projectId');

    if (clipOnly === 'true') {
      setState({
        isClipOnly: true,
        projectId: projectId ?? null,
      });
    }
  }, [searchParams]);

  /**
   * After recording is complete, save the clip blob to sessionStorage
   * and navigate back to the editor.
   */
  const saveClipAndReturn = useCallback((previewUrl: string, blob: Blob) => {
    if (!state.isClipOnly) return;

    // Store the preview URL for the editor to pick up
    sessionStorage.setItem('clipOnlyVideoUrl', previewUrl);

    // Also store metadata
    sessionStorage.setItem('clipOnlyMeta', JSON.stringify({
      timestamp: Date.now(),
      size: blob.size,
      type: blob.type,
      projectId: state.projectId,
    }));

    const editUrl = state.projectId
      ? `/edit?projectId=${state.projectId}&fromClip=true`
      : '/edit?fromClip=true';

    router.push(editUrl);
  }, [state, router]);

  /** Cancel clip-only mode */
  const cancelClipOnly = useCallback(() => {
    setState({ isClipOnly: false, projectId: null });
    sessionStorage.removeItem('clipOnlyVideoUrl');
    sessionStorage.removeItem('clipOnlyMeta');
  }, []);

  return {
    isClipOnly: state.isClipOnly,
    projectId: state.projectId,
    saveClipAndReturn,
    cancelClipOnly,
  };
}
