import type { Video } from '@/types';

export const DB_NAME = 'vib3_offline';
export const DB_VERSION = 1;
export const VIDEOS_STORE = 'videos';
export const METADATA_STORE = 'metadata';
export const MAX_STORAGE_MB = 500;

export interface OfflineVideoMetadata {
  videoId: string;
  video: Video;
  quality: string;
  fileSize: number;
  downloadedAt: string;
  lastPlayedAt?: string;
}

export interface DownloadProgress {
  videoId: string;
  loaded: number;
  total: number;
  percent: number;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
