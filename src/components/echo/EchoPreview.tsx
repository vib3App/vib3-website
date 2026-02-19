'use client';

import { useRef, useEffect } from 'react';
import type { EchoLayout } from '@/hooks/useEchoRecorder';

interface EchoPreviewProps {
  originalVideoUrl: string;
  recordedUrl: string;
  layout: EchoLayout;
  onRetake: () => void;
  onPost: () => void;
  isPosting?: boolean;
}

export function EchoPreview({ originalVideoUrl, recordedUrl, layout, onRetake, onPost, isPosting }: EchoPreviewProps) {
  const origRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    origRef.current?.play();
    recRef.current?.play();
  }, []);

  const containerClass = layout === 'side-by-side'
    ? 'flex'
    : layout === 'top-bottom'
    ? 'flex flex-col'
    : 'relative';

  return (
    <div className="flex flex-col h-full">
      <div className={`flex-1 ${containerClass} overflow-hidden rounded-2xl bg-black`}>
        {layout === 'picture-in-picture' ? (
          <>
            <video ref={origRef} src={originalVideoUrl} className="w-full h-full object-cover" loop muted playsInline />
            <video ref={recRef} src={recordedUrl} className="absolute bottom-4 right-4 w-1/3 aspect-[9/16] rounded-xl object-cover border-2 border-white/20" loop playsInline />
          </>
        ) : (
          <>
            <video ref={origRef} src={originalVideoUrl} className="flex-1 object-cover" loop muted playsInline />
            <video ref={recRef} src={recordedUrl} className="flex-1 object-cover" loop playsInline />
          </>
        )}
      </div>

      <div className="flex gap-3 p-4">
        <button onClick={onRetake} className="flex-1 py-3 glass text-white font-medium rounded-xl hover:bg-white/10 transition">
          Retake
        </button>
        <button onClick={onPost} disabled={isPosting} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50">
          {isPosting ? 'Posting...' : 'Post Echo'}
        </button>
      </div>
    </div>
  );
}
