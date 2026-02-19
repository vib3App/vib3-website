'use client';

/**
 * Camera hook
 * Re-exports from refactored camera module
 */
export { useCamera, useCameraStream, useCameraRecording, CAMERA_FILTERS, CAMERA_EFFECTS, CAMERA_SPEEDS } from './camera';
export type { RecordingState, CameraFacing, CameraMode } from './camera';
export type { HandsFreeMode } from './camera';
