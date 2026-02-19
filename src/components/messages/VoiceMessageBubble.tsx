'use client';

import { useState, useRef, useEffect } from 'react';
import { WaveformVisualizer } from './WaveformVisualizer';

interface VoiceMessageBubbleProps {
  audioUrl: string;
  duration?: number;
  isOwn: boolean;
}

export function VoiceMessageBubble({ audioUrl, duration, isOwn }: VoiceMessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl min-w-[200px] ${isOwn ? 'bg-purple-500' : 'glass'}`}>
      <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center shrink-0" aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
        ) : (
          <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>
      <WaveformVisualizer audioUrl={audioUrl} progress={progress} isPlaying={isPlaying} />
      <span className="text-white/60 text-xs font-mono shrink-0">
        {isPlaying ? formatTime(currentTime) : formatTime(duration || 0)}
      </span>
      <audio ref={audioRef} src={audioUrl} className="hidden" preload="metadata" />
    </div>
  );
}
