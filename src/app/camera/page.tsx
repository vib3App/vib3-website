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

      {/* Top Controls */}
      {camera.recordingState !== 'preview' && (
        <CameraTopControls
          flashOn={camera.flashOn}
          torchSupported={camera.torchSupported}
          timerMode={camera.timerMode}
          recordingState={camera.recordingState}
          recordingDuration={camera.recordingDuration}
          maxDuration={camera.maxDuration}
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
        onRecord={camera.handleRecordButton}
        onPause={camera.pauseRecording}
        onDiscard={camera.discardRecording}
        onNext={camera.handleNext}
        onGoToUpload={camera.goToUpload}
      />
    </div>
  );
}
