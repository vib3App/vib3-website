'use client';

import { useRef } from 'react';

interface VideoDropzoneProps {
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (file: File) => void;
}

export function VideoDropzone({
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: VideoDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
        isDragging
          ? 'border-purple-500 bg-purple-500/10'
          : 'glass border-white/20 hover:border-white/40'
      }`}
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        Drag and drop video files to upload
      </h2>
      <p className="text-white/50 mb-6">
        Or click to browse from your device
      </p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-8 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
      >
        Select Video
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => e.target.files?.[0] && onFileSelect(e.target.files[0])}
        className="hidden"
      />
      <p className="text-white/30 text-sm mt-6">
        MP4, MOV, or WebM • Max 500MB • Up to 10 minutes
      </p>
    </div>
  );
}
