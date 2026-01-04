'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon, PlayIcon } from '@heroicons/react/24/outline';
import type { Video } from '@/types';

interface OfflineVideo {
  videoId: string;
  video: Video;
  quality: string;
  fileSize: number;
  downloadedAt: string;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface DownloadedVideoCardProps {
  offlineVideo: OfflineVideo;
  onDelete: () => void;
  onPlay: () => void;
}

export function DownloadedVideoCard({ offlineVideo, onDelete, onPlay }: DownloadedVideoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { video } = offlineVideo;

  const handleDelete = async () => {
    if (!confirm('Remove this video from downloads?')) return;
    setIsDeleting(true);
    await onDelete();
  };

  return (
    <div className="flex gap-4 p-3 glass-card rounded-xl group">
      <button onClick={onPlay} className="relative flex-shrink-0">
        <div className="w-32 h-20 rounded-lg overflow-hidden bg-white/10">
          {video.thumbnailUrl ? (
            <Image src={video.thumbnailUrl} alt={video.caption || ''} width={128} height={80} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white/30" />
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
            <PlayIcon className="w-5 h-5 text-black ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-[10px]">
            {formatDuration(video.duration)}
          </span>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium truncate mb-1">{video.caption || 'Untitled'}</h3>
        <Link href={`/profile/${video.userId}`} className="text-white/50 text-sm hover:underline">@{video.username}</Link>
        <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
          <span>{offlineVideo.quality}</span>
          <span>{formatBytes(offlineVideo.fileSize)}</span>
          <span>{formatDate(offlineVideo.downloadedAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={handleDelete} disabled={isDeleting} className="p-2 hover:bg-red-500/20 rounded-full transition disabled:opacity-50">
          {isDeleting ? (
            <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
          ) : (
            <TrashIcon className="w-5 h-5 text-red-400" />
          )}
        </button>
      </div>
    </div>
  );
}

export type { OfflineVideo };
