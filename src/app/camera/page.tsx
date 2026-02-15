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
  const {
    isAuthenticated,
    isAuthVerified,
    recordingState,
    previewUrl,
    previewVideoRef,
    selectedFilter,
    setSelectedFilter,
    selectedEffect,
    setSelectedEffect,
    selectedSpeed,
    setSelectedSpeed,
    videoRef,
    cameraFacing,
    effectsCanvasRef,
    error,
    countdown,
    clipCount,
    totalClipsDuration,
    maxDuration,
    recordingDuration,
    formatTime,
    flashOn,
    torchSupported,
    timerMode,
    remainingDuration,
    goBack,
    toggleFlash,
    cycleTimer,
    flipCamera,
    showFilters,
    showEffects,
    showSpeed,
    togglePanel,
    canAddMoreClips,
    isCombining,
    mergeProgress,
    handleRecordButton,
    pauseRecording,
    removeLastClip,
    discardAllClips,
    discardRecording,
    goToPreview,
    handleNext,
    goToUpload,
  } = useCamera();

  // Show loading while auth is being verified or if not authenticated
  if (!isAuthVerified || !isAuthenticated) {
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
        {recordingState === 'preview' && previewUrl ? (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            className="w-full h-full object-cover"
            style={{ filter: CAMERA_FILTERS[selectedFilter].filter }}
            autoPlay
            loop
            playsInline
            muted
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{
                filter: CAMERA_FILTERS[selectedFilter].filter,
                transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
              }}
              autoPlay
              playsInline
              muted
            />
            {/* Particle effects overlay canvas */}
            <canvas
              ref={effectsCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-8xl font-bold text-white animate-pulse">{countdown}</span>
        </div>
      )}

      {/* Clip Timeline Indicator (when recording or has clips) */}
      {recordingState !== 'preview' && (clipCount > 0 || recordingState === 'recording') && (
        <div className="absolute top-20 left-4 right-4 z-20">
          <div className="bg-black/40 rounded-full h-1.5 overflow-hidden">
            {/* Existing clips progress */}
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
              style={{ width: `${(totalClipsDuration / maxDuration) * 100}%` }}
            />
            {/* Current recording progress (stacked on top) */}
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
          {/* Time remaining */}
          <div className="flex justify-between mt-1 px-1">
            <span className="text-white/70 text-xs">
              {formatTime(totalClipsDuration + recordingDuration)}
            </span>
            <span className="text-white/70 text-xs">
              {formatTime(maxDuration)}
            </span>
          </div>
        </div>
      )}

      {/* Top Controls */}
      {recordingState !== 'preview' && (
        <CameraTopControls
          flashOn={flashOn}
          torchSupported={torchSupported}
          timerMode={timerMode}
          recordingState={recordingState}
          recordingDuration={recordingDuration}
          maxDuration={remainingDuration}
          onClose={goBack}
          onFlashToggle={toggleFlash}
          onTimerCycle={cycleTimer}
          onFlipCamera={flipCamera}
          formatTime={formatTime}
        />
      )}

      {/* Side Controls */}
      {recordingState !== 'preview' && (
        <CameraSideControls
          showFilters={showFilters}
          showEffects={showEffects}
          showSpeed={showSpeed}
          onTogglePanel={togglePanel}
        />
      )}

      {/* Panels */}
      {showFilters && recordingState !== 'preview' && (
        <FiltersPanel
          selectedFilter={selectedFilter}
          onSelect={setSelectedFilter}
        />
      )}

      {showEffects && recordingState !== 'preview' && (
        <EffectsPanel
          selectedEffect={selectedEffect}
          onSelect={setSelectedEffect}
        />
      )}

      {showSpeed && recordingState !== 'preview' && (
        <SpeedPanel
          selectedSpeed={selectedSpeed}
          onSelect={setSelectedSpeed}
        />
      )}

      {/* Bottom Controls */}
      <CameraBottomControls
        recordingState={recordingState}
        clipCount={clipCount}
        canAddMoreClips={canAddMoreClips}
        isCombining={isCombining}
        mergeProgress={mergeProgress}
        onRecord={handleRecordButton}
        onPause={pauseRecording}
        onRemoveLastClip={removeLastClip}
        onDiscardAll={discardAllClips}
        onDiscard={discardRecording}
        onGoToPreview={goToPreview}
        onNext={handleNext}
        onGoToUpload={goToUpload}
      />
    </div>
  );
}
