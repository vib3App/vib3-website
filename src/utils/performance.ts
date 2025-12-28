/**
 * Performance optimization utilities
 */

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallback(
  callback: IdleRequestCallback,
  options?: IdleRequestOptions
): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }

  // Fallback for Safari
  const start = Date.now();
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1) as unknown as number;
}

/**
 * Cancel idle callback
 */
export function cancelIdleCallback(handle: number): void {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    window.cancelIdleCallback(handle);
  } else {
    clearTimeout(handle);
  }
}

/**
 * Preload an image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images with concurrency limit
 */
export async function preloadImages(
  urls: string[],
  concurrency = 3
): Promise<void> {
  const queue = [...urls];
  const inProgress: Promise<void>[] = [];

  while (queue.length > 0 || inProgress.length > 0) {
    while (inProgress.length < concurrency && queue.length > 0) {
      const url = queue.shift()!;
      const promise = preloadImage(url).finally(() => {
        const index = inProgress.indexOf(promise);
        if (index > -1) inProgress.splice(index, 1);
      });
      inProgress.push(promise);
    }

    if (inProgress.length > 0) {
      await Promise.race(inProgress);
    }
  }
}

/**
 * Preload a video (first few seconds)
 */
export function preloadVideo(src: string, seconds = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    video.onloadeddata = () => {
      // Seek to trigger buffering
      video.currentTime = Math.min(seconds, video.duration || seconds);
      resolve();
    };

    video.onerror = reject;
    video.src = src;
    video.load();
  });
}

/**
 * Lazy load images with IntersectionObserver
 */
export function lazyLoadImages(
  selector = 'img[data-src]',
  rootMargin = '100px'
): () => void {
  if (typeof window === 'undefined') return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.dataset.src;
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin }
  );

  document.querySelectorAll(selector).forEach((img) => {
    observer.observe(img);
  });

  return () => observer.disconnect();
}

/**
 * Memory-efficient array chunking
 */
export function* chunkArray<T>(array: T[], chunkSize: number): Generator<T[]> {
  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

/**
 * Virtual list helper for calculating visible items
 */
export function calculateVisibleItems(
  totalItems: number,
  itemHeight: number,
  containerHeight: number,
  scrollTop: number,
  overscan = 3
): { startIndex: number; endIndex: number; offsetY: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY };
}

/**
 * Measure render time
 */
export function measureRender(name: string): () => void {
  if (typeof window === 'undefined' || !window.performance) {
    return () => {};
  }

  const startMark = `${name}-start`;
  const endMark = `${name}-end`;

  performance.mark(startMark);

  return () => {
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);

    const entries = performance.getEntriesByName(name);
    if (entries.length > 0) {
      console.log(`[Performance] ${name}: ${entries[0].duration.toFixed(2)}ms`);
    }

    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(name);
  };
}

/**
 * Web Vitals reporter
 */
export interface WebVitals {
  CLS: number | null;
  FID: number | null;
  LCP: number | null;
  FCP: number | null;
  TTFB: number | null;
}

export function reportWebVitals(onReport: (vitals: Partial<WebVitals>) => void): void {
  if (typeof window === 'undefined') return;

  // Report First Contentful Paint
  const paintObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        onReport({ FCP: entry.startTime });
      }
    }
  });

  try {
    paintObserver.observe({ type: 'paint', buffered: true });
  } catch {
    // Observer not supported
  }

  // Report Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    onReport({ LCP: lastEntry.startTime });
  });

  try {
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Observer not supported
  }

  // Report First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEventTiming;
      onReport({ FID: fidEntry.processingStart - fidEntry.startTime });
    }
  });

  try {
    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch {
    // Observer not supported
  }

  // Report Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as PerformanceEntry & { hadRecentInput: boolean; value: number };
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value;
        onReport({ CLS: clsValue });
      }
    }
  });

  try {
    clsObserver.observe({ type: 'layout-shift', buffered: true });
  } catch {
    // Observer not supported
  }
}
