'use client';

import { useRef } from 'react';
import Image from 'next/image';

interface VideoPreviewEditorProps {
  videoUrl: string;
  thumbnailOptions: string[];
  selectedThumbnail: string | null;
  onThumbnailSelect: (thumbnail: string) => void;
  onCustomThumbnail: (file: File) => void;
  onNext: () => void;
}

export function VideoPreviewEditor({
  videoUrl,
  thumbnailOptions,
  selectedThumbnail,
  onThumbnailSelect,
  onCustomThumbnail,
  onNext,
}: VideoPreviewEditorProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative">
          <video
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
          />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-white font-medium mb-3">Cover Image</h3>
            <div className="flex gap-3 flex-wrap">
              {thumbnailOptions.map((thumb, i) => (
                <button
                  key={i}
                  onClick={() => onThumbnailSelect(thumb)}
                  className={`w-20 h-28 rounded-lg overflow-hidden ${
                    selectedThumbnail === thumb ? 'ring-2 ring-[#6366F1]' : ''
                  }`}
                >
                  <Image
                    src={thumb}
                    alt={`Thumbnail ${i + 1}`}
                    width={80}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                className="w-20 h-28 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-white/50 hover:border-white/40"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Upload</span>
              </button>
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && onCustomThumbnail(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Quick Edits</h3>
            <div className="grid grid-cols-3 gap-3">
              <EditButton icon="trim" label="Trim" />
              <EditButton icon="sound" label="Sound" />
              <EditButton icon="filters" label="Filters" />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
      >
        Next: Add Details
      </button>
    </div>
  );
}

function EditButton({ icon, label }: { icon: string; label: string }) {
  const icons: Record<string, React.ReactNode> = {
    trim: (
      <svg className="w-6 h-6 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
    sound: (
      <svg className="w-6 h-6 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    filters: (
      <svg className="w-6 h-6 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  };

  return (
    <button className="p-4 bg-[#1A1F2E] rounded-xl text-center hover:bg-[#252A3E] transition-colors">
      {icons[icon]}
      <span className="text-white/70 text-sm">{label}</span>
    </button>
  );
}
