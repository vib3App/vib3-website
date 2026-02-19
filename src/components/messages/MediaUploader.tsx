'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface MediaUploaderProps {
  onSend: (file: File, type: 'image' | 'video') => void;
  onClose: () => void;
}

export function MediaUploader({ onSend, onClose }: MediaUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video'>('image');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setFileType(type);
    setSelectedFile(file);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleSend = useCallback(() => {
    if (selectedFile) {
      onSend(selectedFile, fileType);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    }
  }, [selectedFile, fileType, previewUrl, onSend]);

  const handleCancel = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onClose();
  }, [previewUrl, onClose]);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // File selection view
  if (!selectedFile || !previewUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="w-full max-w-sm glass-heavy rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="text-white font-medium text-sm">Send Media</h3>
            <button onClick={handleCancel} className="text-white/50 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6 flex flex-col items-center gap-4">
            <button
              onClick={openFilePicker}
              className="w-20 h-20 glass rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <p className="text-white/40 text-sm">Choose a photo or video</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Preview view
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-heavy rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-medium text-sm">
            {fileType === 'video' ? 'Send Video' : 'Send Image'}
          </h3>
          <button onClick={handleCancel} className="text-white/50 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-square bg-black/50 flex items-center justify-center">
          {fileType === 'video' ? (
            <video
              src={previewUrl}
              className="max-w-full max-h-full object-contain"
              controls
              playsInline
            />
          ) : (
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
            />
          )}
        </div>

        <div className="flex items-center gap-3 p-4">
          <button
            onClick={openFilePicker}
            className="flex-1 py-2.5 glass rounded-full text-white/70 text-sm hover:bg-white/10 transition-colors"
          >
            Change
          </button>
          <button
            onClick={handleSend}
            className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full text-white text-sm font-medium hover:from-purple-600 hover:to-teal-600 transition-colors"
          >
            Send
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
