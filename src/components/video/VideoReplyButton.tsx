'use client';

import { useState, useRef, useCallback } from 'react';
import { uploadApi, TusUploadManager } from '@/services/api';
import { videoApi } from '@/services/api';
import { logger } from '@/utils/logger';

interface VideoReplyButtonProps {
  videoId: string;
  commentId: string;
  onReplyPosted?: () => void;
}

type ReplyState = 'idle' | 'selecting' | 'uploading' | 'posting' | 'done' | 'error';

export function VideoReplyButton({ videoId, commentId, onReplyPosted }: VideoReplyButtonProps) {
  const [state, setState] = useState<ReplyState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a video file');
      setState('error');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('Video reply must be under 100MB');
      setState('error');
      return;
    }

    setState('uploading');
    setError(null);
    setProgress(0);

    try {
      const tusManager = new TusUploadManager();

      tusManager.onProgress = (p) => setProgress(p);

      tusManager.onComplete = async (uploadId) => {
        setState('posting');
        try {
          // Post as a reply comment with video reference
          await videoApi.replyToComment(videoId, commentId, `[Video Reply] Upload: ${uploadId}`);
          setState('done');
          onReplyPosted?.();
          // Reset after a moment
          setTimeout(() => setState('idle'), 2000);
        } catch {
          setError('Failed to post reply');
          setState('error');
        }
      };

      tusManager.onError = (err) => {
        setError(err.message);
        setState('error');
      };

      await tusManager.start(file);
    } catch (err) {
      logger.error('Video reply upload failed:', err);
      setError('Upload failed');
      setState('error');
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [videoId, commentId, onReplyPosted]);

  const handleReset = useCallback(() => {
    setState('idle');
    setError(null);
    setProgress(0);
  }, []);

  return (
    <div className="inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {state === 'idle' && (
        <button
          onClick={handleSelectFile}
          className="flex items-center gap-1 text-purple-400 text-xs hover:text-purple-300 transition"
          title="Reply with video"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Video Reply</span>
        </button>
      )}

      {state === 'uploading' && (
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${progress}%` }} />
          </div>
          <span>{Math.round(progress)}%</span>
        </div>
      )}

      {state === 'posting' && (
        <span className="text-xs text-purple-400 animate-pulse">Posting...</span>
      )}

      {state === 'done' && (
        <span className="text-xs text-green-400">Reply posted!</span>
      )}

      {state === 'error' && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-red-400">{error}</span>
          <button onClick={handleReset} className="text-xs text-white/40 hover:text-white/60">Retry</button>
        </div>
      )}
    </div>
  );
}
