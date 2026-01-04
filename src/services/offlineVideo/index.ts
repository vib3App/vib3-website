import { initializeDb } from './database';
import { downloadVideo, isDownloading, cancelDownload } from './downloads';
import {
  isDownloaded,
  getOfflineVideo,
  getOfflineVideos,
  deleteOfflineVideo,
  clearAllDownloads,
  getUsedStorage,
  getStorageUsage,
  isOnline,
} from './storage';

export const offlineVideoService = {
  initialize: initializeDb,
  isDownloaded,
  isDownloading,
  downloadVideo,
  cancelDownload,
  getOfflineVideo,
  getOfflineVideos,
  deleteOfflineVideo,
  clearAllDownloads,
  getUsedStorage,
  getStorageUsage,
  isOnline,
};

export type { OfflineVideoMetadata, DownloadProgress } from './types';
