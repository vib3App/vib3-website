'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';

const filters = [
  { name: 'Normal', filter: 'none' },
  { name: 'Vintage', filter: 'sepia(0.5) contrast(1.1)' },
  { name: 'B&W', filter: 'grayscale(1)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.4)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.7)' },
  { name: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Fade', filter: 'contrast(0.9) brightness(1.1) saturate(0.8)' },
  { name: 'Drama', filter: 'contrast(1.3) brightness(0.9)' },
];

type EditMode = 'trim' | 'filters' | 'text' | 'stickers' | 'audio';

function EditContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const videoUrl = searchParams.get('video') || sessionStorage.getItem('editVideoUrl');

  const [editMode, setEditMode] = useState<EditMode>('trim');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const [volume, setVolume] = useState(1);
  const [texts, setTexts] = useState<Array<{ id: string; text: string; x: number; y: number; color: string; fontSize: number }>>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!videoUrl) {
      router.push('/upload');
    }
  }, [videoUrl, router]);

  // Generate thumbnails from video
  const generateThumbnails = useCallback(async () => {
    if (!videoRef.current || thumbnailsRef.current.length > 0) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 60;
    canvas.height = 80;

    const thumbCount = 10;
    const interval = video.duration / thumbCount;

    for (let i = 0; i < thumbCount; i++) {
      video.currentTime = i * interval;
      await new Promise(resolve => {
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          thumbnailsRef.current.push(canvas.toDataURL('image/jpeg', 0.5));
          resolve(null);
        };
      });
    }

    video.currentTime = 0;
  }, []);

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setTrimEnd(videoRef.current.duration);
      setVideoLoaded(true);
      generateThumbnails();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      setCurrentTime(videoRef.current.currentTime);

      // Loop within trim range
      if (videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      if (videoRef.current.currentTime < trimStart || videoRef.current.currentTime >= trimEnd) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimelineMouseDown = (e: React.MouseEvent, type: 'start' | 'end' | 'playhead') => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleTimelineMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !timelineRef.current || !videoRef.current) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = percent * duration;

    if (isDragging === 'start') {
      setTrimStart(Math.min(time, trimEnd - 1));
    } else if (isDragging === 'end') {
      setTrimEnd(Math.max(time, trimStart + 1));
    } else if (isDragging === 'playhead') {
      videoRef.current.currentTime = Math.max(trimStart, Math.min(trimEnd, time));
      setCurrentTime(time);
    }
  }, [isDragging, duration, trimStart, trimEnd]);

  const handleTimelineMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTimelineMouseMove);
      window.addEventListener('mouseup', handleTimelineMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleTimelineMouseMove);
        window.removeEventListener('mouseup', handleTimelineMouseUp);
      };
    }
  }, [isDragging, handleTimelineMouseMove, handleTimelineMouseUp]);

  const addText = () => {
    if (!newText.trim()) return;

    setTexts(prev => [...prev, {
      id: Date.now().toString(),
      text: newText,
      x: 50,
      y: 50,
      color: '#ffffff',
      fontSize: 24,
    }]);
    setNewText('');
    setShowTextInput(false);
  };

  const handleDone = () => {
    // Store edit settings in session
    sessionStorage.setItem('editSettings', JSON.stringify({
      trimStart,
      trimEnd,
      filter: filters[selectedFilter].filter,
      volume,
      texts,
    }));
    router.push('/upload?from=edit');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  const modes: { id: EditMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'trim',
      label: 'Trim',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>,
    },
    {
      id: 'filters',
      label: 'Filters',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    },
    {
      id: 'text',
      label: 'Text',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    },
    {
      id: 'stickers',
      label: 'Stickers',
      icon: <span className="text-lg">😀</span>,
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    },
  ];

  if (!videoUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0A0E1A]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 bg-[#0A0E1A]">
        <button onClick={() => router.back()} className="text-white/50 hover:text-white">
          Cancel
        </button>
        <h1 className="text-white font-medium">Edit</h1>
        <button onClick={handleDone} className="text-[#6366F1] font-medium">
          Done
        </button>
      </header>

      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full max-h-full object-contain"
          style={{ filter: filters[selectedFilter].filter }}
          onLoadedMetadata={handleVideoLoad}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {/* Text Overlays */}
        {texts.map((text) => (
          <div
            key={text.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${text.x}%`,
              top: `${text.y}%`,
              transform: 'translate(-50%, -50%)',
              color: text.color,
              fontSize: text.fontSize,
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {text.text}
          </div>
        ))}

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="absolute inset-0 flex items-center justify-center"
        >
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </button>

        {/* Time Display */}
        <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Edit Modes Tabs */}
      <div className="bg-[#1A1F2E] border-t border-white/5">
        <div className="flex overflow-x-auto scrollbar-hide">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setEditMode(mode.id)}
              className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 ${
                editMode === mode.id ? 'text-[#6366F1]' : 'text-white/50'
              }`}
            >
              {mode.icon}
              <span className="text-xs">{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Edit Controls */}
        <div className="p-4 min-h-[200px]">
          {editMode === 'trim' && videoLoaded && (
            <div className="space-y-4">
              {/* Timeline */}
              <div
                ref={timelineRef}
                className="relative h-16 bg-[#0A0E1A] rounded-lg overflow-hidden cursor-pointer"
              >
                {/* Thumbnails */}
                <div className="absolute inset-0 flex">
                  {thumbnailsRef.current.map((thumb, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-cover bg-center"
                      style={{ backgroundImage: `url(${thumb})` }}
                    />
                  ))}
                </div>

                {/* Trim overlay - before */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-black/70"
                  style={{ width: `${(trimStart / duration) * 100}%` }}
                />

                {/* Trim overlay - after */}
                <div
                  className="absolute top-0 bottom-0 right-0 bg-black/70"
                  style={{ width: `${((duration - trimEnd) / duration) * 100}%` }}
                />

                {/* Trim handles */}
                <div
                  className="absolute top-0 bottom-0 w-3 bg-[#6366F1] cursor-ew-resize rounded-l"
                  style={{ left: `calc(${(trimStart / duration) * 100}% - 6px)` }}
                  onMouseDown={(e) => handleTimelineMouseDown(e, 'start')}
                >
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/50" />
                </div>
                <div
                  className="absolute top-0 bottom-0 w-3 bg-[#6366F1] cursor-ew-resize rounded-r"
                  style={{ left: `${(trimEnd / duration) * 100}%` }}
                  onMouseDown={(e) => handleTimelineMouseDown(e, 'end')}
                >
                  <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/50" />
                </div>

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
                  style={{ left: `${(currentTime / duration) * 100}%` }}
                  onMouseDown={(e) => handleTimelineMouseDown(e, 'playhead')}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>

              {/* Trim Info */}
              <div className="flex justify-between text-sm">
                <div className="text-white/50">
                  Start: <span className="text-white">{formatTime(trimStart)}</span>
                </div>
                <div className="text-white/50">
                  Duration: <span className="text-[#6366F1]">{formatTime(trimEnd - trimStart)}</span>
                </div>
                <div className="text-white/50">
                  End: <span className="text-white">{formatTime(trimEnd)}</span>
                </div>
              </div>
            </div>
          )}

          {editMode === 'filters' && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {filters.map((filter, index) => (
                <button
                  key={filter.name}
                  onClick={() => setSelectedFilter(index)}
                  className={`flex-shrink-0 text-center ${
                    selectedFilter === index ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  <div
                    className={`w-16 h-20 rounded-lg overflow-hidden mb-1 ${
                      selectedFilter === index ? 'ring-2 ring-[#6366F1]' : ''
                    }`}
                  >
                    <div
                      className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500"
                      style={{ filter: filter.filter }}
                    />
                  </div>
                  <span className="text-white text-xs">{filter.name}</span>
                </button>
              ))}
            </div>
          )}

          {editMode === 'text' && (
            <div className="space-y-4">
              {showTextInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter text..."
                    className="flex-1 bg-[#0A0E1A] text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30"
                    autoFocus
                  />
                  <button
                    onClick={addText}
                    className="px-4 py-3 bg-[#6366F1] text-white rounded-xl"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTextInput(true)}
                  className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40"
                >
                  + Add Text
                </button>
              )}

              {texts.length > 0 && (
                <div className="space-y-2">
                  {texts.map((text) => (
                    <div
                      key={text.id}
                      className="flex items-center justify-between p-3 bg-[#0A0E1A] rounded-lg"
                    >
                      <span className="text-white">{text.text}</span>
                      <button
                        onClick={() => setTexts(prev => prev.filter(t => t.id !== text.id))}
                        className="text-white/30 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {editMode === 'stickers' && (
            <div className="text-center text-white/50 py-8">
              <span className="text-4xl mb-4 block">🎨</span>
              <p>Stickers coming soon!</p>
            </div>
          )}

          {editMode === 'audio' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-white mb-2">
                  <span>Original Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setVolume(val);
                    if (videoRef.current) videoRef.current.volume = val;
                  }}
                  className="w-full accent-[#6366F1]"
                />
              </div>

              <button className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40">
                + Add Music
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function EditLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6366F1]" />
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<EditLoading />}>
      <EditContent />
    </Suspense>
  );
}
