'use client';

import { useState, useRef } from 'react';

interface VideoMessageProps {
  mediaUrl: string;
  mediaThumbnail?: string;
  mediaDuration?: number;
  isOwn: boolean;
}

/** Renders a video message with thumbnail and play button */
export function VideoMessage({ mediaUrl, mediaThumbnail, mediaDuration, isOwn }: VideoMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (videoRef.current) {
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      setIsPlaying(false);
      videoRef.current.pause();
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden max-w-[250px] ${isOwn ? 'bg-purple-500/20' : 'glass'}`}>
      <video
        ref={videoRef}
        src={mediaUrl}
        poster={mediaThumbnail}
        className="w-full max-h-[300px] object-cover"
        onEnded={handleEnded}
        onClick={isPlaying ? handlePause : handlePlay}
        playsInline
        preload="metadata"
      />

      {/* Play button overlay */}
      {!isPlaying && (
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity hover:bg-black/40"
          aria-label="Play video"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Duration badge */}
      {mediaDuration && !isPlaying && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-white text-xs">
          {formatDuration(mediaDuration)}
        </div>
      )}

      {/* Video icon badge */}
      <div className="absolute top-2 left-2">
        <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
}
