import type { VideoDraft } from '@/types';

export type UploadStep = 'select' | 'edit' | 'details' | 'uploading' | 'processing' | 'complete';

export interface UploadState {
  step: UploadStep;
  videoFile: File | null;
  videoPreviewUrl: string | null;
  uploadId: string | null;
  thumbnailOptions: string[];
  selectedThumbnail: string | null;
  caption: string;
  hashtags: string[];
  selectedVibe: string | null;
  visibility: 'public' | 'followers' | 'private';
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  uploadProgress: number;
  isDragging: boolean;
  showSchedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
  drafts: VideoDraft[];
  showDrafts: boolean;
  isSavingDraft: boolean;
  error: string | null;
}

export const DEFAULT_UPLOAD_STATE: Omit<UploadState, 'drafts'> = {
  step: 'select',
  videoFile: null,
  videoPreviewUrl: null,
  uploadId: null,
  thumbnailOptions: [],
  selectedThumbnail: null,
  caption: '',
  hashtags: [],
  selectedVibe: null,
  visibility: 'public',
  allowComments: true,
  allowDuet: true,
  allowStitch: true,
  uploadProgress: 0,
  isDragging: false,
  showSchedule: false,
  scheduleDate: '',
  scheduleTime: '',
  showDrafts: false,
  isSavingDraft: false,
  error: null,
};
