/**
 * Upload types for video publishing
 */

export type UploadStatus =
  | 'pending'
  | 'uploading'
  | 'processing'
  | 'ready'
  | 'published'
  | 'failed'
  | 'scheduled';

export type DraftStatus = 'draft' | 'ready' | 'discarded';

export interface VideoUpload {
  id: string;
  userId: string;
  status: UploadStatus;
  progress: number;
  videoUrl?: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  thumbnailOptions?: string[];
  duration?: number;
  width?: number;
  height?: number;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface VideoDraft {
  id: string;
  userId: string;
  status: DraftStatus;
  uploadId?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption: string;
  hashtags: string[];
  soundId?: string;
  soundTitle?: string;
  mentions: string[];
  isPublic: boolean;
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishVideoInput {
  uploadId: string;
  caption: string;
  hashtags?: string[];
  mentions?: string[];
  thumbnailUrl?: string;
  isPublic?: boolean;
  allowComments?: boolean;
  allowDuet?: boolean;
  allowStitch?: boolean;
  scheduledFor?: string;
}

export interface UploadChunkInfo {
  uploadUrl: string;
  uploadId: string;
  chunkSize: number;
  expiresAt: string;
}

export interface ThumbnailGenerationResult {
  thumbnails: string[];
  defaultIndex: number;
}

export interface ScheduleOptions {
  date: string;
  time: string;
  timezone: string;
}
