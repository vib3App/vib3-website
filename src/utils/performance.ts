/**
 * Performance optimization utilities
 * Re-exports from refactored module
 */
export {
  debounce,
  throttle,
  requestIdleCallback,
  cancelIdleCallback,
  chunkArray,
  preloadImage,
  preloadImages,
  preloadVideo,
  lazyLoadImages,
  calculateVisibleItems,
  measureRender,
  reportWebVitals,
} from './performance/index';

export type { WebVitals } from './performance/index';
