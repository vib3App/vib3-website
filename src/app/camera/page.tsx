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
import { useEffect, useRef } from 'react';

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
    echo, echoSubmitting,
    greenScreenEnabled, setGreenScreenEnabled, greenScreenBg, setGreenScreenBg,
    greenScreenStream, greenScreenBgPresets,
  } = useCamera();

  const greenScreenVideoRef = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const el = greenScreenVideoRef.current;
    if (!el) return;
    if (greenScreenStream) {
      el.srcObject = greenScreenStream;
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [greenScreenStream]);

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

      {echo.isActive && echo.originalVideo && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/30 backdrop-blur border border-purple-400/40 text-white text-sm">
          <span aria-hidden="true">🎙️</span>
          <span>Echo with @{echo.originalVideo.username}</span>
        </div>
      )}

      {echo.isActive && echo.originalVideo?.videoUrl && (
        <video
          src={echo.originalVideo.videoUrl}
          className="absolute bottom-32 right-4 z-30 w-24 aspect-[9/16] rounded-lg shadow-lg object-cover border border-white/20"
          autoPlay loop playsInline muted
          aria-label={`Original video by @${echo.originalVideo.username}`}
        />
      )}

      {echoSubmitting && (
        <div className="absolute inset-0 z-40 bg-black/80 flex flex-col items-center justify-center gap-3 text-white">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Compositing echo on server…</p>
        </div>
      )}

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
                display: (isCameraKitActive || greenScreenEnabled) ? 'none' : undefined,
              }}
              autoPlay playsInline muted
            />
            <video
              ref={greenScreenVideoRef}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                display: greenScreenEnabled ? undefined : 'none',
              }}
              autoPlay playsInline muted
            />
            {!isCameraKitActive && !greenScreenEnabled && (
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

      {/* Live green-screen control */}
      {!isPreview && (
        <div className="absolute top-28 right-4 z-20 flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={() => setGreenScreenEnabled(!greenScreenEnabled)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              greenScreenEnabled
                ? 'bg-green-500 text-white'
                : 'bg-black/60 text-white/80 hover:bg-black/80'
            }`}
            aria-label={`Green screen ${greenScreenEnabled ? 'on' : 'off'}`}
          >
            <span className="mr-1" aria-hidden="true">🟩</span>
            Green Screen
          </button>
          {greenScreenEnabled && (
            <div className="flex flex-col gap-1 p-1 rounded-xl bg-black/80 backdrop-blur border border-white/10">
              {greenScreenBgPresets.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setGreenScreenBg(p.id)}
                  className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[11px] transition ${
                    greenScreenBg === p.id ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-sm border border-white/30"
                    style={{ backgroundColor: p.color }}
                    aria-hidden="true"
                  />
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
