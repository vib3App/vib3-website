'use client';

import { useEffect } from 'react';
import { EchoLayoutSelector } from './EchoLayoutSelector';
import type { EchoLayout } from '@/hooks/useEchoRecorder';

interface EchoRecorderProps {
  originalVideoUrl: string;
  layout: EchoLayout;
  onLayoutChange: (layout: EchoLayout) => void;
  isRecording: boolean;
  duration: number;
  cameraReady: boolean;
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>;
  originalVideoRef: React.RefObject<HTMLVideoElement | null>;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onInitCamera: () => void;
}

export function EchoRecorder({
  originalVideoUrl,
  layout,
  onLayoutChange,
  isRecording,
  duration,
  cameraReady,
  cameraVideoRef,
  originalVideoRef,
  onStartRecording,
  onStopRecording,
  onInitCamera,
}: EchoRecorderProps) {
  useEffect(() => {
    onInitCamera();
  }, [onInitCamera]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const containerClass = layout === 'side-by-side'
    ? 'flex'
    : layout === 'top-bottom'
    ? 'flex flex-col'
    : 'relative';

  return (
    <div className="flex flex-col h-full">
      {/* Layout selector */}
      <div className="flex justify-center py-3">
        <EchoLayoutSelector layout={layout} onChange={onLayoutChange} />
      </div>

      {/* Split screen */}
      <div className={`flex-1 ${containerClass} overflow-hidden rounded-2xl bg-black mx-4`}>
        {layout === 'picture-in-picture' ? (
          <>
            <video ref={originalVideoRef} src={originalVideoUrl} className="w-full h-full object-cover" playsInline muted />
            <video ref={cameraVideoRef} autoPlay playsInline muted className="absolute bottom-4 right-4 w-1/3 aspect-[9/16] rounded-xl object-cover border-2 border-white/20 mirror" />
          </>
        ) : (
          <>
            <div className="flex-1 relative overflow-hidden">
              <video ref={originalVideoRef} src={originalVideoUrl} className="w-full h-full object-cover" playsInline muted />
              <span className="absolute top-2 left-2 text-white/40 text-xs glass px-2 py-0.5 rounded-full">Original</span>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <video ref={cameraVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              <span className="absolute top-2 left-2 text-white/40 text-xs glass px-2 py-0.5 rounded-full">You</span>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 py-6">
        {isRecording && (
          <span className="text-red-400 font-mono text-sm">{formatDuration(duration)}</span>
        )}
        {!cameraReady ? (
          <div className="w-16 h-16 rounded-full glass flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${
              isRecording ? 'bg-transparent' : 'bg-red-500'
            }`}
          >
            {isRecording ? (
              <div className="w-6 h-6 bg-red-500 rounded-sm" />
            ) : (
              <div className="w-10 h-10 bg-red-500 rounded-full" />
            )}
          </button>
        )}
      </div>

      <style jsx global>{`
        .mirror { transform: scaleX(-1); }
      `}</style>
    </div>
  );
}
