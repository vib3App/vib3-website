/**
 * Video player hooks - split for maintainability
 *
 * useHlsPlayer - HLS streaming initialization and quality management
 * usePlaybackState - Core playback state (play/pause, progress, volume)
 * useVideoUI - UI controls (fullscreen, PiP, menus, overlays)
 */
export { useHlsPlayer } from './useHlsPlayer';
export { usePlaybackState } from './usePlaybackState';
export { useVideoUI } from './useVideoUI';
