'use client';

import { useState, useCallback } from 'react';
import { locationApi } from '@/services/api/location';
import { logger } from '@/utils/logger';

interface GhostModeToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

/**
 * Gap #52: Ghost Mode Enforcement
 * When ghost mode is ON:
 * - Location updates stop (handled by useLocationWebSocket + useLocationMap)
 * - User's marker removed from others' maps (handled by backend)
 * - Shows "Ghost Mode Active" visual indicator
 * - Calls PUT /api/location/privacy to set ghost mode on backend
 */
export function GhostModeToggle({ enabled, onToggle }: GhostModeToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = useCallback(async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      // Call the privacy endpoint as well (belt and suspenders with the settings update)
      await locationApi.updateLocationSettings({ ghostMode: !enabled });
      onToggle();
    } catch (err) {
      logger.error('Failed to toggle ghost mode:', err);
      // Still toggle locally - onToggle handles optimistic update + revert
      onToggle();
    } finally {
      setIsToggling(false);
    }
  }, [enabled, onToggle, isToggling]);

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
          enabled
            ? 'bg-purple-500/30 text-purple-300 ring-1 ring-purple-500/50'
            : 'glass text-white/50 hover:text-white hover:bg-white/10'
        } disabled:opacity-70`}
        title={enabled ? 'Ghost Mode: ON - Your location is hidden' : 'Ghost Mode: OFF - Your location is visible'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d={enabled
              ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
              : 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
            }
          />
        </svg>
        {isToggling ? '...' : enabled ? 'Ghost Mode' : 'Visible'}
      </button>

      {/* Ghost Mode Active indicator overlay for the map */}
      {enabled && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="px-2 py-0.5 text-[10px] bg-purple-500/30 text-purple-300 rounded-full ring-1 ring-purple-500/20">
            Location Hidden
          </span>
        </div>
      )}
    </div>
  );
}

/** Full-screen ghost mode banner for the map */
export function GhostModeBanner({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <div className="absolute top-32 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full ring-1 ring-purple-500/30">
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
        </svg>
        <span className="text-purple-300 text-sm font-medium">Ghost Mode Active</span>
        <span className="text-purple-400/60 text-xs">Your location is hidden from others</span>
      </div>
    </div>
  );
}
