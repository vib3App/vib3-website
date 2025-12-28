'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { GlassCard, GlassPill, SoundVisualizer } from '@/components/ui/Glass';

// ═══════════════════════════════════════════════════════════
// BENTO ITEM - Individual grid cell with tilt effect
// ═══════════════════════════════════════════════════════════

interface BentoItemProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'tall';
  href?: string;
  className?: string;
  onClick?: () => void;
}

export function BentoItem({ children, size = 'sm', href, className = '', onClick }: BentoItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 10, y: -x * 10 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const sizes = {
    sm: 'bento-sm',
    md: 'bento-md',
    lg: 'bento-lg',
    xl: 'bento-xl',
    wide: 'bento-wide',
    tall: 'bento-tall',
  };

  const content = (
    <div
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`
        bento-item glass-card p-0 cursor-pointer
        ${sizes[size]}
        ${className}
      `}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

// ═══════════════════════════════════════════════════════════
// TRENDING HERO CARD - Large featured content
// ═══════════════════════════════════════════════════════════

interface TrendingHeroProps {
  video: {
    id: string;
    thumbnailUrl: string;
    title: string;
    creator: string;
    creatorAvatar: string;
    views: string;
    isLive?: boolean;
  };
}

export function TrendingHero({ video }: TrendingHeroProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BentoItem size="xl" href={`/watch/${video.id}`}>
      <div
        className="relative w-full h-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Video/Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
          style={{
            backgroundImage: `url(${video.thumbnailUrl})`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Live Indicator */}
        {video.isLive && (
          <div className="absolute top-4 left-4">
            <GlassPill color="pink" pulse>
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              LIVE
            </GlassPill>
          </div>
        )}

        {/* Trending Badge */}
        <div className="absolute top-4 right-4">
          <GlassPill color="orange">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z" />
            </svg>
            TRENDING
          </GlassPill>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-2xl font-bold mb-2 line-clamp-2">{video.title}</h2>
          <div className="flex items-center gap-3">
            <img
              src={video.creatorAvatar}
              alt={video.creator}
              className="w-10 h-10 rounded-full border-2 border-white/20"
            />
            <div>
              <p className="font-medium">{video.creator}</p>
              <p className="text-sm text-white/60">{video.views} views</p>
            </div>
          </div>
        </div>

        {/* Play Button Overlay */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="w-20 h-20 rounded-full glass-heavy flex items-center justify-center glow-pulse">
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// LIVE PULSE CARD - Currently live content
// ═══════════════════════════════════════════════════════════

interface LivePulseCardProps {
  streams: Array<{
    id: string;
    thumbnailUrl: string;
    streamerName: string;
    viewers: number;
  }>;
}

export function LivePulseCard({ streams }: LivePulseCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % streams.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [streams.length]);

  const activeStream = streams[activeIndex];

  return (
    <BentoItem size="md" href={`/live/${activeStream?.id}`}>
      <div className="relative w-full h-full p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <GlassPill color="pink" pulse>
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            LIVE NOW
          </GlassPill>
          <span className="text-sm text-white/60">{streams.length} streams</span>
        </div>

        {/* Active Stream Preview */}
        <div className="flex-1 relative rounded-xl overflow-hidden mb-3">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${activeStream?.thumbnailUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="font-medium text-sm truncate">{activeStream?.streamerName}</p>
            <p className="text-xs text-white/60">{activeStream?.viewers.toLocaleString()} watching</p>
          </div>
        </div>

        {/* Stream Indicators */}
        <div className="flex justify-center gap-1.5">
          {streams.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? 'bg-pink-500 w-6' : 'bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// VIBE SELECTOR CARD - Mood-based browsing
// ═══════════════════════════════════════════════════════════

const VIBES = [
  { id: 'chill', name: 'Chill', emoji: '😌', color: 'from-blue-500 to-purple-500' },
  { id: 'hype', name: 'Hype', emoji: '🔥', color: 'from-orange-500 to-pink-500' },
  { id: 'dark', name: 'Dark', emoji: '🌙', color: 'from-gray-800 to-purple-900' },
  { id: 'funny', name: 'Funny', emoji: '😂', color: 'from-yellow-400 to-orange-500' },
  { id: 'aesthetic', name: 'Aesthetic', emoji: '✨', color: 'from-pink-400 to-purple-400' },
  { id: 'learn', name: 'Learn', emoji: '🧠', color: 'from-green-400 to-teal-500' },
];

interface VibeSelectorProps {
  activeVibe: string | null;
  onSelect: (vibe: string) => void;
}

export function VibeSelector({ activeVibe, onSelect }: VibeSelectorProps) {
  return (
    <BentoItem size="wide">
      <div className="w-full h-full p-4">
        <h3 className="text-lg font-bold mb-3 gradient-text">Pick Your Vibe</h3>
        <div className="grid grid-cols-3 gap-2 h-[calc(100%-2rem)]">
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => onSelect(vibe.id)}
              className={`
                relative rounded-xl p-2 transition-all duration-300
                flex flex-col items-center justify-center gap-1
                ${activeVibe === vibe.id
                  ? `bg-gradient-to-br ${vibe.color} scale-105 shadow-lg`
                  : 'bg-white/5 hover:bg-white/10 hover:scale-102'
                }
              `}
            >
              <span className="text-xl">{vibe.emoji}</span>
              <span className="text-xs font-medium">{vibe.name}</span>
            </button>
          ))}
        </div>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// SOUND WAVE CARD - Trending sounds
// ═══════════════════════════════════════════════════════════

interface SoundWaveCardProps {
  sounds: Array<{
    id: string;
    name: string;
    artist: string;
    uses: number;
    coverUrl: string;
  }>;
}

export function SoundWaveCard({ sounds }: SoundWaveCardProps) {
  const [activeSound, setActiveSound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <BentoItem size="md">
      <div className="w-full h-full p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Trending Sounds</h3>
          <SoundVisualizer isPlaying={isPlaying} />
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {sounds.map((sound, i) => (
            <button
              key={sound.id}
              onClick={() => {
                setActiveSound(i);
                setIsPlaying(true);
              }}
              className={`
                w-full flex items-center gap-3 p-2 rounded-xl transition-all
                ${activeSound === i ? 'bg-white/10' : 'hover:bg-white/5'}
              `}
            >
              <img
                src={sound.coverUrl}
                alt={sound.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm truncate">{sound.name}</p>
                <p className="text-xs text-white/60 truncate">{sound.artist}</p>
              </div>
              <span className="text-xs text-white/40">{(sound.uses / 1000).toFixed(1)}K</span>
            </button>
          ))}
        </div>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// VIDEO PREVIEW CARD - Small video thumbnails
// ═══════════════════════════════════════════════════════════

interface VideoPreviewCardProps {
  video: {
    id: string;
    thumbnailUrl: string;
    duration?: string;
    views?: string;
  };
  size?: 'sm' | 'md';
}

export function VideoPreviewCard({ video, size = 'sm' }: VideoPreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <BentoItem size={size} href={`/watch/${video.id}`}>
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
          style={{
            backgroundImage: `url(${video.thumbnailUrl})`,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {video.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-xs">
            {video.duration}
          </div>
        )}

        {video.views && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white/80">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
            </svg>
            {video.views}
          </div>
        )}

        {/* Hover Play Icon */}
        <div
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-200
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// CHALLENGE BANNER - Active challenges
// ═══════════════════════════════════════════════════════════

interface ChallengeBannerProps {
  challenge: {
    id: string;
    title: string;
    hashtag: string;
    participants: number;
    reward?: string;
    backgroundUrl: string;
    endsIn: string;
  };
}

export function ChallengeBanner({ challenge }: ChallengeBannerProps) {
  return (
    <BentoItem size="wide" href={`/challenges/${challenge.id}`}>
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${challenge.backgroundUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-transparent" />

        <div className="relative h-full flex items-center p-4">
          <div className="flex-1">
            <GlassPill color="purple" className="mb-2">
              #{challenge.hashtag}
            </GlassPill>
            <h3 className="text-lg font-bold mb-1">{challenge.title}</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/60">
                {challenge.participants.toLocaleString()} joined
              </span>
              <span className="text-orange-400">Ends {challenge.endsIn}</span>
            </div>
          </div>

          {challenge.reward && (
            <div className="text-right">
              <p className="text-xs text-white/60 mb-1">Prize</p>
              <p className="text-xl font-bold gradient-text">{challenge.reward}</p>
            </div>
          )}
        </div>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// CREATOR SPOTLIGHT - Featured creators
// ═══════════════════════════════════════════════════════════

interface CreatorSpotlightProps {
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    followers: string;
    isVerified?: boolean;
  };
}

export function CreatorSpotlight({ creator }: CreatorSpotlightProps) {
  return (
    <BentoItem size="sm" href={`/profile/${creator.id}`}>
      <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center">
        <div className="relative mb-2">
          <img
            src={creator.avatarUrl}
            alt={creator.name}
            className="w-14 h-14 rounded-full border-2 border-purple-500/50"
          />
          {creator.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
          )}
        </div>
        <p className="font-medium text-sm truncate w-full">{creator.name}</p>
        <p className="text-xs text-white/60">{creator.followers} followers</p>
      </div>
    </BentoItem>
  );
}

// ═══════════════════════════════════════════════════════════
// COLLAB ROOM CARD - Active collaboration rooms
// ═══════════════════════════════════════════════════════════

interface CollabRoomCardProps {
  room: {
    id: string;
    name: string;
    participants: Array<{ avatarUrl: string }>;
    isRecording?: boolean;
  };
}

export function CollabRoomCard({ room }: CollabRoomCardProps) {
  return (
    <BentoItem size="sm" href={`/collab/${room.id}`}>
      <div className="w-full h-full p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm truncate">{room.name}</h4>
          {room.isRecording && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex -space-x-2">
            {room.participants.slice(0, 4).map((p, i) => (
              <img
                key={i}
                src={p.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-black"
              />
            ))}
            {room.participants.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs">
                +{room.participants.length - 4}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <span className="text-xs text-teal-400">Join Room</span>
        </div>
      </div>
    </BentoItem>
  );
}
