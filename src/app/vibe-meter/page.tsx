'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '@/stores/authStore';
import { AuroraBackground } from '@/components/ui/AuroraBackground';

// Vibe types matching Flutter app
type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Focused';

interface VibeData {
  color: string;
  emoji: string;
  contentTypes: string[];
}

const VIBES: Record<VibeType, VibeData> = {
  Energetic: {
    color: '#f97316', // orange
    emoji: '⚡',
    contentTypes: ['workout', 'dance', 'motivation'],
  },
  Chill: {
    color: '#00CED1', // dark cyan
    emoji: '😌',
    contentTypes: ['lofi', 'nature', 'meditation'],
  },
  Creative: {
    color: '#a855f7', // purple
    emoji: '🎨',
    contentTypes: ['art', 'music', 'diy'],
  },
  Social: {
    color: '#FF0080', // pink
    emoji: '🎉',
    contentTypes: ['party', 'friends', 'events'],
  },
  Focused: {
    color: '#22c55e', // green
    emoji: '🎯',
    contentTypes: ['study', 'work', 'productivity'],
  },
};

const VIBE_ORDER: VibeType[] = ['Chill', 'Focused', 'Creative', 'Social', 'Energetic'];

function getVibeFromLevel(level: number): VibeType {
  if (level < 20) return 'Chill';
  if (level < 40) return 'Focused';
  if (level < 60) return 'Creative';
  if (level < 80) return 'Social';
  return 'Energetic';
}

export default function VibeMeterPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [vibeLevel, setVibeLevel] = useState(50);
  const [currentVibe, setCurrentVibe] = useState<VibeType>('Chill');
  const [isApplying, setIsApplying] = useState(false);

  const vibeData = VIBES[currentVibe];

  // Load saved vibe preference
  useEffect(() => {
    if (!isAuthVerified) return;

    if (!isAuthenticated) {
      router.push('/login?redirect=/vibe-meter');
      return;
    }

    // Load from localStorage
    const savedVibe = localStorage.getItem('vib3_vibe_preference');
    const savedIntensity = localStorage.getItem('vib3_vibe_intensity');

    if (savedVibe && savedVibe in VIBES) {
      setCurrentVibe(savedVibe as VibeType);
    }
    if (savedIntensity) {
      setVibeLevel(parseInt(savedIntensity, 10) || 50);
    }
  }, [isAuthenticated, isAuthVerified, router]);

  // Update vibe when slider changes
  const handleSliderChange = (value: number) => {
    setVibeLevel(value);
    setCurrentVibe(getVibeFromLevel(value));
  };

  // Select a specific vibe
  const handleVibeSelect = (vibe: VibeType) => {
    setCurrentVibe(vibe);
  };

  // Apply vibe to feed
  const handleApplyVibe = async () => {
    setIsApplying(true);

    try {
      // Save preference locally
      localStorage.setItem('vib3_vibe_preference', currentVibe);
      localStorage.setItem('vib3_vibe_intensity', vibeLevel.toString());

      // Navigate to feed with vibe param — backend filters via ?vibe= query
      router.push('/?vibe=' + encodeURIComponent(currentVibe));
    } catch (error) {
      console.error('Failed to apply vibe:', error);
    } finally {
      setIsApplying(false);
    }
  };

  // Reset to default algorithm
  const handleReset = () => {
    localStorage.removeItem('vib3_vibe_preference');
    localStorage.removeItem('vib3_vibe_intensity');
    router.push('/');
  };

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      <AuroraBackground intensity={20} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <XMarkIcon className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
          Vib3 Meter
        </h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Vibe Visualization */}
        <div className="relative mb-8">
          {/* Animated glow background */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-40 transition-colors duration-300"
            style={{
              backgroundColor: vibeData.color,
              width: 280,
              height: 280,
              margin: 'auto',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
          />
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-30 transition-colors duration-300"
            style={{
              backgroundColor: vibeData.color,
              width: 220,
              height: 220,
              margin: 'auto',
              transform: 'translate(-50%, -50%)',
              left: '50%',
              top: '50%',
            }}
          />

          {/* Vibe indicator */}
          <div className="relative flex flex-col items-center">
            <span className="text-7xl mb-4">{vibeData.emoji}</span>
            <span className="text-3xl font-bold text-white mb-2">{currentVibe}</span>
            <span
              className="text-2xl font-semibold transition-colors duration-300"
              style={{ color: vibeData.color }}
            >
              {vibeLevel}% Vib3
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div
        className="relative z-20 rounded-t-[32px] px-6 pt-6 pb-8"
        style={{
          backgroundColor: 'rgba(20, 20, 25, 0.95)',
          boxShadow: `0 -20px 60px ${vibeData.color}33`,
        }}
      >
        <h2 className="text-xl font-bold text-white text-center mb-6">
          How are you vibing today?
        </h2>

        {/* Vibe Slider */}
        <div className="mb-8">
          <input
            type="range"
            min="0"
            max="100"
            value={vibeLevel}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${vibeData.color} 0%, ${vibeData.color} ${vibeLevel}%, rgba(255,255,255,0.2) ${vibeLevel}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        {/* Vibe Options */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {VIBE_ORDER.map((vibe) => {
            const data = VIBES[vibe];
            const isSelected = currentVibe === vibe;

            return (
              <button
                key={vibe}
                onClick={() => handleVibeSelect(vibe)}
                className="flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isSelected ? `${data.color}33` : 'transparent',
                  border: `2px solid ${isSelected ? data.color : 'transparent'}`,
                  boxShadow: isSelected ? `0 0 20px ${data.color}4d` : 'none',
                }}
              >
                <span className="text-xl">{data.emoji}</span>
                <span
                  className="font-medium transition-colors"
                  style={{ color: isSelected ? data.color : 'white' }}
                >
                  {vibe}
                </span>
              </button>
            );
          })}
        </div>

        {/* Apply Button */}
        <button
          onClick={handleApplyVibe}
          disabled={isApplying}
          className="w-full py-4 rounded-full font-bold text-lg text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: vibeData.color }}
        >
          {isApplying ? 'Tuning...' : 'Tune My Feed'}
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full mt-3 py-3 text-white/50 text-sm hover:text-white/70 transition"
        >
          Reset to Default
        </button>

        {/* Safe area padding */}
        <div className="h-4" />
      </div>

      {/* Custom slider thumb styles */}
      <style jsx>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          background: ${vibeData.color};
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px ${vibeData.color}80;
        }

        input[type='range']::-moz-range-thumb {
          width: 28px;
          height: 28px;
          background: ${vibeData.color};
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px ${vibeData.color}80;
        }
      `}</style>
    </div>
  );
}
