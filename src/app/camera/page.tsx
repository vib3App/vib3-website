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
  const {
    isAuthenticated, isAuthVerified, cameraMode, handleCameraModeChange,
    recordingState, cameraFacing, selectedFilter, setSelectedFilter,
    selectedEffect, setSelectedEffect, selectedSpeed, setSelectedSpeed,
    recordingDuration, maxDuration, setMaxDuration, flashOn, torchSupported,
    toggleFlash, timerMode, countdown, showFilters, showEffects, showSpeed,
    showLenses, showDuration, showEffectCategories, showTemplates,
    showPhotoPreview, setShowPhotoPreview, previewUrl, error,
    videoRef, previewVideoRef, effectsCanvasRef, flipCamera,
    handleRecordButton, pauseRecording, discardRecording, handleNext,
    formatTime, togglePanel, cycleTimer, goBack, goToUpload,
    clipCount, totalClipsDuration, remainingDuration, canAddMoreClips,
    isCombining, mergeProgress, removeLastClip, discardAllClips, goToPreview,
    cameraKitCanvasRef, isCameraKitActive, cameraKitLenses, activeLensId,
    cameraKitLoading, cameraKitError, cameraKitLoaded, handleLensSelect,
    photo, zoom, handsFree, template, challenge, dm, clipOnly,
  } = useCamera();

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (showPhotoPreview) {
    return (
      <div className="min-h-screen bg-black">
        <PhotoPreview
          photos={photo.capturedPhotos}
          onDownload={photo.downloadPhoto}
          onDelete={photo.deletePhoto}
          onClearAll={photo.clearPhotos}
          onClose={() => setShowPhotoPreview(false)}
        />
      </div>
    );
  }

  const isVideoMode = cameraMode === 'video' || cameraMode === 'story';
  const isRecordingActive = recordingState === 'recording' || recordingState === 'paused';
  const isPreview = recordingState === 'preview';

  return (
    <div className="min-h-screen bg-black">
      <TopNav />

      {/* Camera/Preview View */}
      <div
        className="absolute inset-0"
        onTouchStart={zoom.handleTouchStart}
        onTouchMove={zoom.handleTouchMove}
        onTouchEnd={zoom.handleTouchEnd}
      >
        {isPreview && previewUrl ? (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            className="w-full h-full object-cover"
            style={{ filter: CAMERA_FILTERS[selectedFilter].filter }}
            autoPlay loop playsInline muted
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              style={{
                filter: CAMERA_FILTERS[selectedFilter].filter,
                transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                display: isCameraKitActive ? 'none' : undefined,
              }}
              autoPlay playsInline muted
            />
            {!isCameraKitActive && (
              <canvas ref={effectsCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            )}
            <canvas
              ref={cameraKitCanvasRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: isCameraKitActive ? undefined : 'none' }}
            />
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="absolute top-20 left-4 right-4 bg-red-500/90 text-white px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      {/* Countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-8xl font-bold text-white animate-pulse">{countdown}</span>
        </div>
      )}

      {/* Gap 2/5/6/7: Mode indicators */}
      <ModeIndicators
        handsFreeEnabled={handsFree.enabled}
        handsFreeMode={handsFree.mode}
        lastCommand={handsFree.lastCommand}
        challengeActive={challenge.isActive}
        challengeHashtag={challenge.challengeHashtag}
        challengeMaxDuration={challenge.maxDuration}
        isDMMode={dm.isDMMode}
        isClipOnly={clipOnly.isClipOnly}
        isStoryMode={cameraMode === 'story'}
        recordingState={recordingState}
      />

      {/* Collage overlay */}
      <CollageOverlay
        isPhotoMode={cameraMode === 'photo'}
        photoMode={photo.photoMode}
        collagePhotos={photo.collagePhotos}
        collageTarget={photo.collageTarget}
      />

      {/* Clip timeline */}
      <ClipTimeline
        isVideoMode={isVideoMode}
        recordingState={recordingState}
        clipCount={clipCount}
        totalClipsDuration={totalClipsDuration}
        recordingDuration={recordingDuration}
        maxDuration={maxDuration}
        formatTime={formatTime}
      />

      {/* Top Controls */}
      {!isPreview && (
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
          handsFreeEnabled={handsFree.enabled}
          handsFreeSupported={handsFree.speechSupported}
          onHandsFreeToggle={handsFree.toggle}
        />
      )}

      {/* Side Controls */}
      {!isPreview && (
        <CameraSideControls
          showFilters={showFilters}
          showEffects={showEffects}
          showSpeed={showSpeed}
          showLenses={showLenses}
          showDuration={showDuration}
          showEffectCategories={showEffectCategories}
          showTemplates={showTemplates}
          isVideoMode={isVideoMode}
          onTogglePanel={togglePanel}
        />
      )}

      {/* Zoom */}
      {!isPreview && (
        <ZoomIndicator
          zoomLevel={zoom.zoomLevel}
          zoomSupported={zoom.zoomSupported}
          zoomPresets={zoom.zoomPresets}
          onPresetSelect={zoom.setPresetZoom}
        />
      )}

      {/* Gap 4: Template overlay */}
      {template.isActive && !isPreview && (
        <TemplateSelector
          templateState={template.templateState}
          selectedTemplate={template.selectedTemplate}
          currentSlotIndex={template.currentSlotIndex}
          currentSlot={template.currentSlot}
          slotTimeRemaining={template.slotTimeRemaining}
          completedSlots={template.completedSlots}
          onSelectTemplate={template.selectTemplate}
          onStartSlot={() => { template.startSlotRecording(); handleRecordButton(); }}
          onAdvance={template.advanceToNextSlot}
          onRetake={template.retakeCurrentSlot}
          onReset={template.resetTemplate}
        />
      )}

      {/* Template selector panel */}
      {showTemplates && !template.isActive && !isPreview && (
        <TemplateSelector
          templateState="selecting"
          selectedTemplate={null}
          currentSlotIndex={0}
          currentSlot={null}
          slotTimeRemaining={0}
          completedSlots={0}
          onSelectTemplate={(t) => { template.selectTemplate(t); togglePanel('templates'); }}
          onStartSlot={() => {}}
          onAdvance={() => {}}
          onRetake={() => {}}
          onReset={() => togglePanel('templates')}
        />
      )}

      {/* Panels */}
      {showLenses && !isPreview && (
        <LensesPanel
          lenses={cameraKitLenses}
          activeLensId={activeLensId}
          isLoading={cameraKitLoading}
          error={cameraKitError}
          onSelect={handleLensSelect}
        />
      )}

      {showEffectCategories && !isPreview && (
        <EffectCategoriesPanel
          lenses={cameraKitLenses}
          activeLensId={activeLensId}
          isCameraKitLoaded={cameraKitLoaded}
          onSelectLens={handleLensSelect}
        />
      )}

      {showFilters && !isPreview && (
        <FiltersPanel selectedFilter={selectedFilter} onSelect={setSelectedFilter} />
      )}
      {showEffects && !isPreview && (
        <EffectsPanel selectedEffect={selectedEffect} onSelect={setSelectedEffect} />
      )}
      {showSpeed && !isPreview && (
        <SpeedPanel selectedSpeed={selectedSpeed} onSelect={setSelectedSpeed} />
      )}
      {showDuration && !isPreview && (
        <DurationSelector maxDuration={maxDuration} onSelect={setMaxDuration} />
      )}

      {/* Mode Selector */}
      {!isPreview && !isRecordingActive && (
        <div className="absolute bottom-28 left-0 right-0 z-10">
          <CameraModeSelector
            mode={cameraMode}
            onModeChange={handleCameraModeChange}
            disabled={isRecordingActive}
          />
        </div>
      )}

      {/* Bottom Controls */}
      {isVideoMode ? (
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
      ) : (
        <PhotoBottomControls
          photoMode={photo.photoMode}
          onPhotoModeChange={photo.setPhotoMode}
          collageLayout={photo.collageLayout}
          onCollageLayoutChange={photo.setCollageLayout}
          collageCount={photo.collagePhotos.length}
          collageTarget={photo.collageTarget}
          isBurstActive={photo.isBurstActive}
          capturedCount={photo.capturedPhotos.length}
          onShutter={photo.handleShutter}
          onResetCollage={photo.resetCollage}
          onViewPhotos={() => setShowPhotoPreview(true)}
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
