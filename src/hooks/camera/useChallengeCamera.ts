'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Challenge-aware camera hook (Gap 5).
 * Reads URL params: ?challenge=dancechallenge&maxDuration=15
 * Applies constraints to the camera recording session.
 */

export interface ChallengeConstraints {
  challengeHashtag: string | null;
  maxDuration: number | null;
  /** Whether challenge mode is active */
  isActive: boolean;
}

export function useChallengeCamera() {
  const searchParams = useSearchParams();

  const [constraints, setConstraints] = useState<ChallengeConstraints>({
    challengeHashtag: null,
    maxDuration: null,
    isActive: false,
  });

  // Parse URL params on mount
  useEffect(() => {
    const challenge = searchParams.get('challenge');
    const maxDur = searchParams.get('maxDuration');

    if (challenge) {
      const hashtag = challenge.startsWith('#') ? challenge : `#${challenge}`;
      const duration = maxDur ? parseInt(maxDur, 10) : null;

      setConstraints({
        challengeHashtag: hashtag,
        maxDuration: duration && !isNaN(duration) ? duration : null,
        isActive: true,
      });
    }
  }, [searchParams]);

  /** Build the redirect URL for upload with challenge params */
  const getUploadUrl = useCallback((baseUrl: string): string => {
    if (!constraints.isActive || !constraints.challengeHashtag) return baseUrl;

    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('challenge', constraints.challengeHashtag);
    return url.pathname + url.search;
  }, [constraints]);

  /** Clear challenge constraints */
  const clearChallenge = useCallback(() => {
    setConstraints({
      challengeHashtag: null,
      maxDuration: null,
      isActive: false,
    });
  }, []);

  return {
    ...constraints,
    getUploadUrl,
    clearChallenge,
  };
}
