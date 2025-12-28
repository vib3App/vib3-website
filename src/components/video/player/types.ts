export interface Chapter {
  title: string;
  startTime: number;
  endTime?: number;
}

export interface QualityLevel {
  height: number;
  bitrate: number;
  label: string;
}

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (time: number, duration: number) => void;
  onError?: (error: Error) => void;
  className?: string;
  showControls?: boolean;
  isActive?: boolean;
  chapters?: Chapter[];
  onMiniPlayerToggle?: (isMini: boolean) => void;
}

export const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
