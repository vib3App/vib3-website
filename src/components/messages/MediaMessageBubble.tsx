'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface MediaMessageBubbleProps {
  type: 'image' | 'video';
  mediaUrl: string;
  mediaThumbnail?: string;
  mediaDuration?: number;
  isOwn: boolean;
}

export function MediaMessageBubble({
  type, mediaUrl, mediaThumbnail, mediaDuration, isOwn,
}: MediaMessageBubbleProps) {
  if (type === 'video') {
    return (
      <VideoContent
        mediaUrl={mediaUrl}
        mediaThumbnail={mediaThumbnail}
        mediaDuration={mediaDuration}
        isOwn={isOwn}
      />
    );
  }

  return <ImageContent mediaUrl={mediaUrl} isOwn={isOwn} />;
}

function ImageContent({ mediaUrl, isOwn }: { mediaUrl: string; isOwn: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        className={`relative rounded-2xl overflow-hidden block ${isOwn ? '' : ''}`}
      >
        <Image
          src={mediaUrl}
          alt="Image message"
          width={250}
          height={250}
          className="object-cover max-h-[300px] w-auto"
          unoptimized
        />
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setExpanded(false)}
        >
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src={mediaUrl}
            alt="Full size image"
            width={1200}
            height={1200}
            className="max-w-full max-h-full object-contain"
            unoptimized
          />
        </div>
      )}
    </>
  );
}

function VideoContent({
  mediaUrl, mediaThumbnail, mediaDuration, isOwn,
}: {
  mediaUrl: string; mediaThumbnail?: string; mediaDuration?: number; isOwn: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden max-w-[250px] ${isOwn ? 'bg-purple-500/20' : 'glass'}`}>
      <video
        ref={videoRef}
        src={mediaUrl}
        poster={mediaThumbnail}
        className="w-full max-h-[300px] object-cover"
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
        preload="metadata"
      />
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-opacity"
          aria-label="Play video"
        >
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
      {mediaDuration && !isPlaying && (
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 rounded text-white text-xs">
          {formatDuration(mediaDuration)}
        </div>
      )}
    </div>
  );
}
