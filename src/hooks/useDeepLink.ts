'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Deep link URL resolver for vib3app.net URLs.
 * Maps mobile deep link paths to web app routes.
 *
 * Supported patterns:
 *   /video/:id        → /feed?video=:id
 *   /user/:username   → /profile/:username
 *   /profile/:id      → /profile/:id (passthrough)
 *   /live/:id         → /live/:id (passthrough)
 *   /hashtag/:tag     → /hashtag/:tag (passthrough)
 *   /sound/:id        → /sound/:id (passthrough)
 *   /challenge/:id    → /challenge/:id (passthrough)
 *   /gauntlet/:id     → /gauntlets/:id
 *   /share/:code      → resolve share code to content URL
 */
export function useDeepLink() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const deepLink = searchParams.get('dl');
    if (!deepLink) return;

    // Parse the deep link path
    const url = new URL(deepLink, 'https://vib3app.net');
    const path = url.pathname;

    // Map to web routes
    const videoMatch = path.match(/^\/video\/([a-zA-Z0-9]+)$/);
    if (videoMatch) {
      router.replace(`/feed?video=${videoMatch[1]}`);
      return;
    }

    const userMatch = path.match(/^\/user\/(@?[\w.]+)$/);
    if (userMatch) {
      router.replace(`/profile/${userMatch[1].replace('@', '')}`);
      return;
    }

    const gauntletMatch = path.match(/^\/gauntlet\/([a-zA-Z0-9]+)$/);
    if (gauntletMatch) {
      router.replace(`/gauntlets/${gauntletMatch[1]}`);
      return;
    }

    // Passthrough routes that match web app structure
    const passthroughPatterns = ['/profile/', '/live/', '/hashtag/', '/sound/', '/challenge/', '/gauntlets/'];
    for (const pattern of passthroughPatterns) {
      if (path.startsWith(pattern)) {
        router.replace(path);
        return;
      }
    }
  }, [pathname, searchParams, router]);
}
