/**
 * Upload API service
 * Handles video uploads with TUS resumable protocol
 */
import { apiClient } from './client';
import type {
  VideoUpload,
  VideoDraft,
  PublishVideoInput,
  UploadChunkInfo,
  ThumbnailGenerationResult,
} from '@/types';

export const uploadApi = {
  /**
   * Initialize a TUS upload session
   */
  async initUpload(file: File): Promise<UploadChunkInfo> {
    const { data } = await apiClient.post<UploadChunkInfo>('/uploads/init', {
      filename: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
    return data;
  },

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: string): Promise<VideoUpload> {
    const { data } = await apiClient.get<{ upload: VideoUpload }>(`/uploads/${uploadId}`);
    return data.upload;
  },

  /**
   * Resume an interrupted upload
   */
  async resumeUpload(uploadId: string): Promise<{ offset: number; uploadUrl: string }> {
    const { data } = await apiClient.get<{ offset: number; uploadUrl: string }>(
      `/uploads/${uploadId}/resume`
    );
    return data;
  },

  /**
   * Cancel an upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    await apiClient.delete(`/uploads/${uploadId}`);
  },

  /**
   * Generate thumbnail options for uploaded video
   */
  async generateThumbnails(uploadId: string): Promise<ThumbnailGenerationResult> {
    const { data } = await apiClient.post<ThumbnailGenerationResult>(
      `/uploads/${uploadId}/thumbnails`
    );
    return data;
  },

  /**
   * Upload custom thumbnail
   */
  async uploadThumbnail(uploadId: string, file: File): Promise<{ thumbnailUrl: string }> {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const { data } = await apiClient.post<{ thumbnailUrl: string }>(
      `/uploads/${uploadId}/thumbnail`,
      formData
    );
    return data;
  },

  /**
   * Publish video
   */
  async publishVideo(input: PublishVideoInput): Promise<{ videoId: string }> {
    const { data } = await apiClient.post<{ videoId: string }>('/videos/publish', input);
    return data;
  },

  /**
   * Schedule video for later
   */
  async scheduleVideo(
    input: PublishVideoInput & { scheduledFor: string }
  ): Promise<{ videoId: string; scheduledFor: string }> {
    const { data } = await apiClient.post<{ videoId: string; scheduledFor: string }>(
      '/videos/schedule',
      input
    );
    return data;
  },

  // ========== Drafts ==========

  /**
   * Get all drafts
   */
  async getDrafts(): Promise<VideoDraft[]> {
    const { data } = await apiClient.get<{ drafts: VideoDraft[] }>('/drafts');
    return data.drafts;
  },

  /**
   * Get a single draft
   */
  async getDraft(draftId: string): Promise<VideoDraft> {
    const { data } = await apiClient.get<{ draft: VideoDraft }>(`/drafts/${draftId}`);
    return data.draft;
  },

  /**
   * Create a new draft
   */
  async createDraft(draft: Partial<VideoDraft>): Promise<VideoDraft> {
    const { data } = await apiClient.post<{ draft: VideoDraft }>('/drafts', draft);
    return data.draft;
  },

  /**
   * Update a draft
   */
  async updateDraft(draftId: string, draft: Partial<VideoDraft>): Promise<VideoDraft> {
    const { data } = await apiClient.patch<{ draft: VideoDraft }>(`/drafts/${draftId}`, draft);
    return data.draft;
  },

  /**
   * Delete a draft
   */
  async deleteDraft(draftId: string): Promise<void> {
    await apiClient.delete(`/drafts/${draftId}`);
  },

  /**
   * Publish a draft
   */
  async publishDraft(draftId: string): Promise<{ videoId: string }> {
    const { data } = await apiClient.post<{ videoId: string }>(`/drafts/${draftId}/publish`);
    return data;
  },

  // ========== Scheduled ==========

  /**
   * Get scheduled videos
   */
  async getScheduledVideos(): Promise<VideoDraft[]> {
    const { data } = await apiClient.get<{ videos: VideoDraft[] }>('/videos/scheduled');
    return data.videos;
  },

  /**
   * Cancel scheduled video
   */
  async cancelScheduledVideo(videoId: string): Promise<void> {
    await apiClient.delete(`/videos/scheduled/${videoId}`);
  },

  /**
   * Update scheduled video
   */
  async updateScheduledVideo(
    videoId: string,
    updates: Partial<PublishVideoInput>
  ): Promise<VideoDraft> {
    const { data } = await apiClient.patch<{ video: VideoDraft }>(
      `/videos/scheduled/${videoId}`,
      updates
    );
    return data.video;
  },
};

/**
 * TUS Upload Manager
 * Handles chunked uploads with resume capability
 */
export class TusUploadManager {
  private chunkSize = 5 * 1024 * 1024; // 5MB chunks
  private uploadUrl: string | null = null;
  private uploadId: string | null = null;
  private offset = 0;
  private file: File | null = null;
  private aborted = false;

  onProgress?: (progress: number) => void;
  onComplete?: (uploadId: string) => void;
  onError?: (error: Error) => void;

  async start(file: File): Promise<void> {
    this.file = file;
    this.aborted = false;
    this.offset = 0;

    try {
      // Initialize upload
      const { uploadUrl, uploadId, chunkSize } = await uploadApi.initUpload(file);
      this.uploadUrl = uploadUrl;
      this.uploadId = uploadId;
      this.chunkSize = chunkSize || this.chunkSize;

      // Start uploading chunks
      await this.uploadChunks();
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  async resume(uploadId: string, file: File): Promise<void> {
    this.file = file;
    this.uploadId = uploadId;
    this.aborted = false;

    try {
      const { offset, uploadUrl } = await uploadApi.resumeUpload(uploadId);
      this.offset = offset;
      this.uploadUrl = uploadUrl;

      await this.uploadChunks();
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  abort(): void {
    this.aborted = true;
    if (this.uploadId) {
      uploadApi.cancelUpload(this.uploadId).catch(() => {});
    }
  }

  private async uploadChunks(): Promise<void> {
    if (!this.file || !this.uploadUrl) return;

    while (this.offset < this.file.size && !this.aborted) {
      const chunk = this.file.slice(this.offset, this.offset + this.chunkSize);

      try {
        const response = await fetch(this.uploadUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/offset+octet-stream',
            'Upload-Offset': String(this.offset),
            'Tus-Resumable': '1.0.0',
          },
          body: chunk,
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const newOffset = response.headers.get('Upload-Offset');
        if (newOffset) {
          this.offset = parseInt(newOffset, 10);
        } else {
          this.offset += chunk.size;
        }

        const progress = (this.offset / this.file.size) * 100;
        this.onProgress?.(progress);
      } catch (error) {
        // Store progress for resume
        localStorage.setItem(
          `upload_${this.uploadId}`,
          JSON.stringify({ offset: this.offset, fileName: this.file.name })
        );
        throw error;
      }
    }

    if (!this.aborted && this.uploadId) {
      // Clear stored progress
      localStorage.removeItem(`upload_${this.uploadId}`);
      this.onComplete?.(this.uploadId);
    }
  }
}
