'use client';

import { useCamera, CAMERA_FILTERS } from '@/hooks/useCamera';
import {
  CameraTopControls,
  CameraSideControls,
  FiltersPanel,
  EffectsPanel,
  SpeedPanel,
  CameraBottomControls,
} from '@/components/camera';
import { TopNav } from '@/components/ui/TopNav';

export default function CameraPage() {
  const camera = useCamera();

  // Show loading while auth is being verified or if not authenticated
  if (!camera.isAuthVerified || !camera.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <TopNav />
      {/* Camera/Preview View */}
      <div className="absolute inset-0">
        {camera.recordingState === 'preview' && camera.previewUrl ? (
          <video
            ref={camera.previewVideoRef}
            src={camera.previewUrl}
            className="w-full h-full object-cover"
            style={{ filter: CAMERA_FILTERS[camera.selectedFilter].filter }}
            autoPlay
            loop
            playsInline
            muted
          />
        ) : (
          <>
            <video
              ref={camera.videoRef}
              className="w-full h-full object-cover"
              style={{
                filter: CAMERA_FILTERS[camera.selectedFilter].filter,
                transform: camera.cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
              }}
              autoPlay
              playsInline
              muted
            />
            {/* Particle effects overlay canvas */}
            <canvas
              ref={camera.effectsCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </>
        )}
      </div>

      {/* Error Message */}
      {camera.error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl text-sm text-center">
          {camera.error}
        </div>
      )}

      {/* Countdown Overlay */}
      {camera.countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-8xl font-bold text-white animate-pulse">{camera.countdown}</span>
        </div>
      )}

      {/* Clip Timeline Indicator (when recording or has clips) */}
      {camera.recordingState !== 'preview' && (camera.clipCount > 0 || camera.recordingState === 'recording') && (
        <div className="absolute top-20 left-4 right-4 z-20">
          <div className="bg-black/40 rounded-full h-1.5 overflow-hidden">
            {/* Existing clips progress */}
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
              style={{ width: `${(camera.totalClipsDuration / camera.maxDuration) * 100}%` }}
            />
            {/* Current recording progress (stacked on top) */}
            {camera.recordingState === 'recording' && (
              <div
                className="h-full bg-red-500 -mt-1.5 transition-all duration-1000"
                style={{
                  width: `${(camera.recordingDuration / camera.maxDuration) * 100}%`,
                  marginLeft: `${(camera.totalClipsDuration / camera.maxDuration) * 100}%`,
                }}
              />
            )}
          </div>
          {/* Time remaining */}
          <div className="flex justify-between mt-1 px-1">
            <span className="text-white/70 text-xs">
              {camera.formatTime(camera.totalClipsDuration + camera.recordingDuration)}
            </span>
            <span className="text-white/70 text-xs">
              {camera.formatTime(camera.maxDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Top Controls */}
      {camera.recordingState !== 'preview' && (
        <CameraTopControls
          flashOn={camera.flashOn}
          torchSupported={camera.torchSupported}
          timerMode={camera.timerMode}
          recordingState={camera.recordingState}
          recordingDuration={camera.recordingDuration}
          maxDuration={camera.remainingDuration}
          onClose={camera.goBack}
          onFlashToggle={camera.toggleFlash}
          onTimerCycle={camera.cycleTimer}
          onFlipCamera={camera.flipCamera}
          formatTime={camera.formatTime}
        />
      )}

      {/* Side Controls */}
      {camera.recordingState !== 'preview' && (
        <CameraSideControls
          showFilters={camera.showFilters}
          showEffects={camera.showEffects}
          showSpeed={camera.showSpeed}
          onTogglePanel={camera.togglePanel}
        />
      )}

      {/* Panels */}
      {camera.showFilters && camera.recordingState !== 'preview' && (
        <FiltersPanel
          selectedFilter={camera.selectedFilter}
          onSelect={camera.setSelectedFilter}
        />
      )}

      {camera.showEffects && camera.recordingState !== 'preview' && (
        <EffectsPanel
          selectedEffect={camera.selectedEffect}
          onSelect={camera.setSelectedEffect}
        />
      )}

      {camera.showSpeed && camera.recordingState !== 'preview' && (
        <SpeedPanel
          selectedSpeed={camera.selectedSpeed}
          onSelect={camera.setSelectedSpeed}
        />
      )}

      {/* Bottom Controls */}
      <CameraBottomControls
        recordingState={camera.recordingState}
        clipCount={camera.clipCount}
        canAddMoreClips={camera.canAddMoreClips}
        isCombining={camera.isCombining}
        mergeProgress={camera.mergeProgress}
        onRecord={camera.handleRecordButton}
        onPause={camera.pauseRecording}
        onRemoveLastClip={camera.removeLastClip}
        onDiscardAll={camera.discardAllClips}
        onDiscard={camera.discardRecording}
        onGoToPreview={camera.goToPreview}
        onNext={camera.handleNext}
        onGoToUpload={camera.goToUpload}
      />
    </div>
  );
}
