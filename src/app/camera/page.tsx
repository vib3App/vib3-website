'use client';

import { Suspense } from 'react';
import { useCamera, CAMERA_FILTERS } from '@/hooks/useCamera';
import {
  CameraTopControls,
  CameraSideControls,
  FiltersPanel,
  EffectsPanel,
  SpeedPanel,
  CameraBottomControls,
  LensesPanel,
  EffectCategoriesPanel,
  CameraModeSelector,
  PhotoBottomControls,
  PhotoPreview,
  DurationSelector,
  ZoomIndicator,
  TemplateSelector,
  ModeIndicators,
  CollageOverlay,
  ClipTimeline,
} from '@/components/camera';
import { TopNav } from '@/components/ui/TopNav';

function CameraPageInner() {
  const cam = useCamera();

  if (!cam.isAuthVerified || !cam.isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (cam.showPhotoPreview) {
    return (
      <div className="min-h-screen bg-black">
        <PhotoPreview
          photos={cam.photo.capturedPhotos}
          onDownload={cam.photo.downloadPhoto}
          onDelete={cam.photo.deletePhoto}
          onClearAll={cam.photo.clearPhotos}
          onClose={() => cam.setShowPhotoPreview(false)}
        />
      </div>
    );
  }

  const isVideoMode = cam.cameraMode === 'video' || cam.cameraMode === 'story';
  const isRecordingActive = cam.recordingState === 'recording' || cam.recordingState === 'paused';
  const isPreview = cam.recordingState === 'preview';

  return (
    <div className="min-h-screen bg-black">
      <TopNav />

      {/* Camera/Preview View */}
      <div
        className="absolute inset-0"
        onTouchStart={cam.zoom.handleTouchStart}
        onTouchMove={cam.zoom.handleTouchMove}
        onTouchEnd={cam.zoom.handleTouchEnd}
      >
        {isPreview && cam.previewUrl ? (
          <video
            ref={cam.previewVideoRef}
            src={cam.previewUrl}
            className="w-full h-full object-cover"
            style={{ filter: CAMERA_FILTERS[cam.selectedFilter].filter }}
            autoPlay loop playsInline muted
          />
        ) : (
          <>
            <video
              ref={cam.videoRef}
              className="w-full h-full object-cover"
              style={{
                filter: CAMERA_FILTERS[cam.selectedFilter].filter,
                transform: cam.cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                display: cam.isCameraKitActive ? 'none' : undefined,
              }}
              autoPlay playsInline muted
            />
            {!cam.isCameraKitActive && (
              <canvas ref={cam.effectsCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            )}
            <canvas
              ref={cam.cameraKitCanvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: cam.isCameraKitActive ? undefined : 'none' }}
            />
          </>
        )}
      </div>

      {/* Error */}
      {cam.error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl text-sm text-center">
          {cam.error}
        </div>
      )}

      {/* Countdown */}
      {cam.countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-8xl font-bold text-white animate-pulse">{cam.countdown}</span>
        </div>
      )}

      {/* Gap 2/5/6/7: Mode indicators */}
      <ModeIndicators
        handsFreeEnabled={cam.handsFree.enabled}
        handsFreeMode={cam.handsFree.mode}
        lastCommand={cam.handsFree.lastCommand}
        challengeActive={cam.challenge.isActive}
        challengeHashtag={cam.challenge.challengeHashtag}
        challengeMaxDuration={cam.challenge.maxDuration}
        isDMMode={cam.dm.isDMMode}
        isClipOnly={cam.clipOnly.isClipOnly}
        isStoryMode={cam.cameraMode === 'story'}
        recordingState={cam.recordingState}
      />

      {/* Collage overlay */}
      <CollageOverlay
        isPhotoMode={cam.cameraMode === 'photo'}
        photoMode={cam.photo.photoMode}
        collagePhotos={cam.photo.collagePhotos}
        collageTarget={cam.photo.collageTarget}
      />

      {/* Clip timeline */}
      <ClipTimeline
        isVideoMode={isVideoMode}
        recordingState={cam.recordingState}
        clipCount={cam.clipCount}
        totalClipsDuration={cam.totalClipsDuration}
        recordingDuration={cam.recordingDuration}
        maxDuration={cam.maxDuration}
        formatTime={cam.formatTime}
      />

      {/* Top Controls */}
      {!isPreview && (
        <CameraTopControls
          flashOn={cam.flashOn}
          torchSupported={cam.torchSupported}
          timerMode={cam.timerMode}
          recordingState={cam.recordingState}
          recordingDuration={cam.recordingDuration}
          maxDuration={cam.remainingDuration}
          onClose={cam.goBack}
          onFlashToggle={cam.toggleFlash}
          onTimerCycle={cam.cycleTimer}
          onFlipCamera={cam.flipCamera}
          formatTime={cam.formatTime}
          handsFreeEnabled={cam.handsFree.enabled}
          handsFreeSupported={cam.handsFree.speechSupported}
          onHandsFreeToggle={cam.handsFree.toggle}
        />
      )}

      {/* Side Controls */}
      {!isPreview && (
        <CameraSideControls
          showFilters={cam.showFilters}
          showEffects={cam.showEffects}
          showSpeed={cam.showSpeed}
          showLenses={cam.showLenses}
          showDuration={cam.showDuration}
          showEffectCategories={cam.showEffectCategories}
          showTemplates={cam.showTemplates}
          isVideoMode={isVideoMode}
          onTogglePanel={cam.togglePanel}
        />
      )}

      {/* Zoom */}
      {!isPreview && (
        <ZoomIndicator
          zoomLevel={cam.zoom.zoomLevel}
          zoomSupported={cam.zoom.zoomSupported}
          zoomPresets={cam.zoom.zoomPresets}
          onPresetSelect={cam.zoom.setPresetZoom}
        />
      )}

      {/* Gap 4: Template overlay */}
      {cam.template.isActive && !isPreview && (
        <TemplateSelector
          templateState={cam.template.templateState}
          selectedTemplate={cam.template.selectedTemplate}
          currentSlotIndex={cam.template.currentSlotIndex}
          currentSlot={cam.template.currentSlot}
          slotTimeRemaining={cam.template.slotTimeRemaining}
          completedSlots={cam.template.completedSlots}
          onSelectTemplate={cam.template.selectTemplate}
          onStartSlot={() => { cam.template.startSlotRecording(); cam.handleRecordButton(); }}
          onAdvance={cam.template.advanceToNextSlot}
          onRetake={cam.template.retakeCurrentSlot}
          onReset={cam.template.resetTemplate}
        />
      )}

      {/* Template selector panel */}
      {cam.showTemplates && !cam.template.isActive && !isPreview && (
        <TemplateSelector
          templateState="selecting"
          selectedTemplate={null}
          currentSlotIndex={0}
          currentSlot={null}
          slotTimeRemaining={0}
          completedSlots={0}
          onSelectTemplate={(t) => { cam.template.selectTemplate(t); cam.togglePanel('templates'); }}
          onStartSlot={() => {}}
          onAdvance={() => {}}
          onRetake={() => {}}
          onReset={() => cam.togglePanel('templates')}
        />
      )}

      {/* Panels */}
      {cam.showLenses && !isPreview && (
        <LensesPanel
          lenses={cam.cameraKitLenses}
          activeLensId={cam.activeLensId}
          isLoading={cam.cameraKitLoading}
          error={cam.cameraKitError}
          onSelect={cam.handleLensSelect}
        />
      )}

      {cam.showEffectCategories && !isPreview && (
        <EffectCategoriesPanel
          lenses={cam.cameraKitLenses}
          activeLensId={cam.activeLensId}
          isCameraKitLoaded={cam.cameraKitLoaded}
          onSelectLens={cam.handleLensSelect}
        />
      )}

      {cam.showFilters && !isPreview && (
        <FiltersPanel selectedFilter={cam.selectedFilter} onSelect={cam.setSelectedFilter} />
      )}
      {cam.showEffects && !isPreview && (
        <EffectsPanel selectedEffect={cam.selectedEffect} onSelect={cam.setSelectedEffect} />
      )}
      {cam.showSpeed && !isPreview && (
        <SpeedPanel selectedSpeed={cam.selectedSpeed} onSelect={cam.setSelectedSpeed} />
      )}
      {cam.showDuration && !isPreview && (
        <DurationSelector maxDuration={cam.maxDuration} onSelect={cam.setMaxDuration} />
      )}

      {/* Mode Selector */}
      {!isPreview && !isRecordingActive && (
        <div className="absolute bottom-28 left-0 right-0 z-10">
          <CameraModeSelector
            mode={cam.cameraMode}
            onModeChange={cam.handleCameraModeChange}
            disabled={isRecordingActive}
          />
        </div>
      )}

      {/* Bottom Controls */}
      {isVideoMode ? (
        <CameraBottomControls
          recordingState={cam.recordingState}
          clipCount={cam.clipCount}
          canAddMoreClips={cam.canAddMoreClips}
          isCombining={cam.isCombining}
          mergeProgress={cam.mergeProgress}
          onRecord={cam.handleRecordButton}
          onPause={cam.pauseRecording}
          onRemoveLastClip={cam.removeLastClip}
          onDiscardAll={cam.discardAllClips}
          onDiscard={cam.discardRecording}
          onGoToPreview={cam.goToPreview}
          onNext={cam.handleNext}
          onGoToUpload={cam.goToUpload}
        />
      ) : (
        <PhotoBottomControls
          photoMode={cam.photo.photoMode}
          onPhotoModeChange={cam.photo.setPhotoMode}
          collageLayout={cam.photo.collageLayout}
          onCollageLayoutChange={cam.photo.setCollageLayout}
          collageCount={cam.photo.collagePhotos.length}
          collageTarget={cam.photo.collageTarget}
          isBurstActive={cam.photo.isBurstActive}
          capturedCount={cam.photo.capturedPhotos.length}
          onShutter={cam.photo.handleShutter}
          onResetCollage={cam.photo.resetCollage}
          onViewPhotos={() => cam.setShowPhotoPreview(true)}
        />
      )}
    </div>
  );
}

export default function CameraPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    }>
      <CameraPageInner />
    </Suspense>
  );
}
