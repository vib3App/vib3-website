'use client';

import type { CapturedPhoto } from '@/hooks/camera/useCameraPhoto';

interface PhotoPreviewProps {
  photos: CapturedPhoto[];
  onDownload: (photo: CapturedPhoto) => void;
  onDelete: (photoId: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export function PhotoPreview({ photos, onDownload, onDelete, onClearAll, onClose }: PhotoPreviewProps) {
  if (photos.length === 0) {
    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <p className="text-white/60 text-lg mb-4">No photos yet</p>
        <button onClick={onClose} className="px-6 py-2 bg-white/10 text-white rounded-full">
          Back to camera
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onClose} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-white font-medium">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
        <button onClick={onClearAll} className="text-red-400 text-sm">Clear all</button>
      </div>

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1">
          {photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square group">
              <img src={photo.dataUrl} alt="" className="w-full h-full object-cover rounded-lg" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => onDownload(photo)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(photo.id)}
                  className="w-8 h-8 bg-red-500/50 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
