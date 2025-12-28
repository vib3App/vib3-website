'use client';

import { RefObject } from 'react';
import { VideoCameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CapsuleMediaInputProps {
  type: 'video' | 'cover';
  previewUrl: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

export function CapsuleMediaInput({ type, previewUrl, inputRef, onSelect, onClear }: CapsuleMediaInputProps) {
  const isVideo = type === 'video';
  const Icon = isVideo ? VideoCameraIcon : PhotoIcon;
  const label = isVideo ? 'Video' : 'Cover Image (shown before unlock)';
  const placeholder = isVideo ? 'Click to upload video' : 'Add cover image';
  const accept = isVideo ? 'video/*' : 'image/*';

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-2">{label}</label>
      {previewUrl ? (
        <div className={`relative ${isVideo ? 'aspect-video' : 'aspect-video'} bg-gray-900 rounded-xl overflow-hidden`}>
          {isVideo ? (
            <video src={previewUrl} controls className="w-full h-full object-contain" />
          ) : (
            <img src={previewUrl} alt="Cover" className="w-full h-full object-cover" />
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-2 bg-black/70 hover:bg-black rounded-full transition"
          >
            <XMarkIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full ${isVideo ? 'aspect-video' : 'h-32'} bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-purple-500 hover:bg-purple-500/5 transition flex flex-col items-center justify-center gap-3`}
        >
          <Icon className={`${isVideo ? 'w-12 h-12' : 'w-8 h-8'} text-gray-600`} />
          <span className="text-gray-400">{placeholder}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={onSelect} className="hidden" />
    </div>
  );
}
