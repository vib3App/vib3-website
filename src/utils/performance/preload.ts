/**
 * Asset preloading utilities
 */

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export async function preloadImages(urls: string[], concurrency = 3): Promise<void> {
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

export function preloadVideo(src: string, seconds = 5): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(seconds, video.duration || seconds);
      resolve();
    };

    video.onerror = reject;
    video.src = src;
    video.load();
  });
}
