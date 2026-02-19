'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { LiveStream } from '@/types';

/**
 * Gap #37: Live Stream Viewer Player
 *
 * Fallback player for when LiveKit is not available.
 * Attempts HLS playback from stream.hlsUrl, otherwise shows placeholder.
 * Displays live video, viewer count, and host info.
 */

interface LiveViewerPlayerProps {
  stream: LiveStream;
  viewerCount: number;
}

export function LiveViewerPlayer({ stream, viewerCount }: LiveViewerPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hlsLoaded, setHlsLoaded] = useState(false);
  const [hlsError, setHlsError] = useState(false);

  // Try HLS playback if url available
  useEffect(() => {
    if (!stream.hlsUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Check native HLS support (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream.hlsUrl;
      video.play().then(() => setHlsLoaded(true)).catch(() => setHlsError(true));
      return;
    }

    // Dynamic import of HLS.js for other browsers
    let hls: { destroy: () => void } | null = null;
    import('hls.js').then((Hls) => {
      if (!Hls.default.isSupported()) {
        setHlsError(true);
        return;
      }
      const hlsInstance = new Hls.default();
      hlsInstance.loadSource(stream.hlsUrl!);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.default.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setHlsLoaded(true);
      });
      hlsInstance.on(Hls.default.Events.ERROR, () => {
        setHlsError(true);
      });
      hls = hlsInstance;
    }).catch(() => setHlsError(true));

    return () => {
      if (hls) (hls as { destroy: () => void }).destroy();
    };
  }, [stream.hlsUrl]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />

      {/* Placeholder if no HLS or error */}
      {(!stream.hlsUrl || hlsError) && !hlsLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-purple-900/50 to-black">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 mb-4">
            {stream.hostAvatar ? (
              <Image
                src={stream.hostAvatar}
                alt={stream.hostUsername}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                {stream.hostUsername.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <h3 className="text-white text-xl font-semibold mb-1">{stream.hostUsername}</h3>
          <p className="text-white/50 text-sm mb-4">{stream.title}</p>
          <p className="text-white/30 text-xs">
            Connecting to stream...
          </p>
        </div>
      )}

      {/* Overlay: Viewer count + LIVE badge */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full animate-pulse">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="text-white text-sm font-bold">LIVE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          <span className="text-white text-sm font-medium">{viewerCount}</span>
        </div>
      </div>

      {/* Host info */}
      <div className="absolute top-16 left-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden flex-shrink-0">
          {stream.hostAvatar ? (
            <Image
              src={stream.hostAvatar}
              alt={stream.hostUsername}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
              {stream.hostUsername[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{stream.hostUsername}</p>
          <p className="text-white/60 text-xs truncate max-w-[200px]">{stream.title}</p>
        </div>
      </div>
    </div>
  );
}
