'use client';

import type { HandsFreeMode } from '@/hooks/camera/useHandsFree';
import type { CapturedPhoto } from '@/hooks/camera/useCameraPhoto';

interface ModeIndicatorsProps {
  handsFreeEnabled: boolean;
  handsFreeMode: HandsFreeMode;
  lastCommand: string;
  challengeActive: boolean;
  challengeHashtag: string | null;
  challengeMaxDuration: number | null;
  isDMMode: boolean;
  isClipOnly: boolean;
  isStoryMode: boolean;
  recordingState: string;
}

export function ModeIndicators({
  handsFreeEnabled, handsFreeMode, lastCommand,
  challengeActive, challengeHashtag, challengeMaxDuration,
  isDMMode, isClipOnly, isStoryMode, recordingState,
}: ModeIndicatorsProps) {
  const isPreview = recordingState === 'preview';

  return (
    <>
      {/* Voice/Smile command feedback */}
      {lastCommand && (
        <div className="absolute top-32 left-0 right-0 z-30 flex justify-center">
          <div className="px-4 py-2 bg-purple-500/80 rounded-full">
            <span className="text-white font-medium text-sm">{lastCommand}</span>
          </div>
        </div>
      )}

      {/* Hands-free listening/smile indicator */}
      {handsFreeEnabled && !isPreview && (
        <div className="absolute top-14 left-0 right-0 z-20 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              handsFreeMode === 'smile' ? 'bg-yellow-400' : 'bg-green-400'
            }`} />
            <span className="text-white/70 text-xs">
              {handsFreeMode === 'voice'
                ? 'Voice: say Record, Stop, Photo, Flip'
                : 'Smile to record, stop smiling to stop'}
            </span>
          </div>
        </div>
      )}

      {/* Challenge mode indicator */}
      {challengeActive && !isPreview && (
        <div className="absolute top-14 left-4 z-20">
          <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full">
            <span className="text-white text-xs font-semibold">
              {challengeHashtag}
              {challengeMaxDuration && ` (${challengeMaxDuration}s max)`}
            </span>
          </div>
        </div>
      )}

      {/* DM mode indicator */}
      {isDMMode && !isPreview && (
        <div className="absolute top-14 left-4 z-20">
          <div className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
            <span className="text-white text-xs font-semibold">DM Video</span>
          </div>
        </div>
      )}

      {/* Clip-only mode indicator */}
      {isClipOnly && !isPreview && (
        <div className="absolute top-14 left-4 z-20">
          <div className="px-3 py-1 bg-gradient-to-r from-teal-500 to-green-500 rounded-full">
            <span className="text-white text-xs font-semibold">Clip for Timeline</span>
          </div>
        </div>
      )}

      {/* Story mode indicator */}
      {isStoryMode && !challengeActive && !isDMMode && !isClipOnly && !isPreview && (
        <div className="absolute top-14 right-4 z-20">
          <div className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <span className="text-white text-xs font-semibold">STORY</span>
          </div>
        </div>
      )}
    </>
  );
}

interface CollageOverlayProps {
  isPhotoMode: boolean;
  photoMode: string;
  collagePhotos: CapturedPhoto[];
  collageTarget: number;
}

export function CollageOverlay({
  isPhotoMode, photoMode, collagePhotos, collageTarget,
}: CollageOverlayProps) {
  if (!isPhotoMode || photoMode !== 'collage' || collagePhotos.length === 0) return null;

  return (
    <div className="absolute top-20 left-4 right-4 z-20">
      <div className="flex gap-1 justify-center">
        {Array.from({ length: collageTarget }).map((_, i) => (
          <div
            key={i}
            className={`w-8 h-8 rounded border-2 ${
              i < collagePhotos.length
                ? 'border-purple-500 bg-purple-500/30'
                : 'border-white/30'
            }`}
          >
            {collagePhotos[i] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={collagePhotos[i].dataUrl}
                alt=""
                className="w-full h-full object-cover rounded-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ClipTimelineProps {
  isVideoMode: boolean;
  recordingState: string;
  clipCount: number;
  totalClipsDuration: number;
  recordingDuration: number;
  maxDuration: number;
  formatTime: (s: number) => string;
}

export function ClipTimeline({
  isVideoMode, recordingState, clipCount,
  totalClipsDuration, recordingDuration, maxDuration, formatTime,
}: ClipTimelineProps) {
  if (!isVideoMode || recordingState === 'preview') return null;
  if (clipCount === 0 && recordingState !== 'recording') return null;

  return (
    <div className="absolute top-20 left-4 right-4 z-20">
      <div className="bg-black/40 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
          style={{ width: `${(totalClipsDuration / maxDuration) * 100}%` }}
        />
        {recordingState === 'recording' && (
          <div
            className="h-full bg-red-500 -mt-1.5 transition-all duration-1000"
            style={{
              width: `${(recordingDuration / maxDuration) * 100}%`,
              marginLeft: `${(totalClipsDuration / maxDuration) * 100}%`,
            }}
          />
        )}
      </div>
      <div className="flex justify-between mt-1 px-1">
        <span className="text-white/70 text-xs">
          {formatTime(totalClipsDuration + recordingDuration)}
        </span>
        <span className="text-white/70 text-xs">
          {formatTime(maxDuration)}
        </span>
      </div>
    </div>
  );
}
