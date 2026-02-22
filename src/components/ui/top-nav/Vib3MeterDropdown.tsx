'use client';

import Link from 'next/link';
import { useVibeStore, VIBES } from '@/stores/vibeStore';

interface Vib3MeterDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function Vib3MeterDropdown({ isOpen, onToggle, onClose }: Vib3MeterDropdownProps) {
  const { selectedVibe, setSelectedVibe } = useVibeStore();
  const selectedVibeData = VIBES.find(v => v.id === selectedVibe);

  const handleSelect = (vibe: typeof selectedVibe) => {
    setSelectedVibe(vibe);
    onClose();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
          selectedVibe || isOpen
            ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white border border-white/20'
            : 'glass text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span className="text-base">{selectedVibe ? selectedVibeData?.emoji : '✨'}</span>
        <span>{selectedVibe ? selectedVibeData?.label : 'Vib3 Meter'}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[260px] glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-[100] animate-in">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/50 text-xs">Filter by vibe</span>
            <Link
              href="/vibe-meter"
              className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
              onClick={onClose}
            >
              Full Meter
            </Link>
          </div>

          <div className="py-2">
            {/* All / Clear */}
            <button
              onClick={() => handleSelect(null)}
              className={`flex items-center gap-3 w-full px-4 py-3 transition-colors ${
                !selectedVibe
                  ? 'bg-gradient-to-r from-purple-500/15 to-transparent text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-base bg-white/10">🌈</span>
              <div className="text-left">
                <div className="font-medium text-sm">All Vibes</div>
                <div className="text-xs text-white/40">No filter applied</div>
              </div>
              {!selectedVibe && (
                <svg className="w-4 h-4 ml-auto text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Vibe options */}
            {VIBES.map((vibe) => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <button
                  key={vibe.id}
                  onClick={() => handleSelect(vibe.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 transition-colors ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-500/15 to-transparent text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${
                    isSelected ? `bg-gradient-to-r ${vibe.color}` : 'bg-white/10'
                  }`}>
                    {vibe.emoji}
                  </span>
                  <div className="text-left">
                    <div className="font-medium text-sm">{vibe.label}</div>
                  </div>
                  {isSelected && (
                    <svg className="w-4 h-4 ml-auto text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
