'use client';

import { Suspense, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useVideoEditor, EDITOR_FILTERS } from '@/hooks/useVideoEditor';
import { useEditorHistory, type EditorSnapshot } from '@/hooks/videoEditor';
import { useEditorState } from '@/hooks/videoEditor/useEditorState';
import { useVoiceover } from '@/hooks/videoEditor/useVoiceover';
import { useDraftPersistence } from '@/hooks/videoEditor/useDraftPersistence';
import {
  EditorHeader, EditorTabs, TrimPanel, FilterPanel, TunePanel, BlurPanel,
  TextPanel, AudioPanel, StickerPanel, SpeedPanel, TransitionPanel,
  GreenScreenPanel, TemplatePanel, TransformPanel, VoiceoverPanel, CropPanel,
  OpacityPanel, MasksPanel, CaptionsPanel, SplitPanel, DrawingPanel, SFXPanel,
  BeatSyncPanel, FreezeFramePanel, CutoutPanel, StabilizationPanel,
  ClipSpeedPanel, AIAutoEditPanel, MusicLibraryPanel,
  ShoppingPanel, NarrationPanel,
  VoiceEffectsPanel, Transition3DPanel, SpeedRampPanel, GiphyStickerPanel,
  FontUploader, TextAnimationSelector, TextPathSelector,
  KaraokeCaptionPreview, CaptionTranslationPanel,
  AnimatedTextOverlay, Transition3DPreview,
} from '@/components/edit';
import { TopNav } from '@/components/ui/TopNav';

function ProcessingModal({ progress }: { progress: { stage: string; percent: number; message: string } | null }) {
  if (!progress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          {progress.stage === 'error' ? (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : progress.stage === 'complete' ? (
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <>
              <svg className="w-16 h-16 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {progress.percent}%
              </span>
            </>
          )}
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          {progress.stage === 'loading' && 'Loading Processor'}
          {progress.stage === 'processing' && 'Processing Video'}
          {progress.stage === 'encoding' && 'Encoding Video'}
          {progress.stage === 'complete' && 'Complete!'}
          {progress.stage === 'error' && 'Processing Failed'}
        </h3>
        <p className="text-white/60">{progress.message}</p>

        {progress.stage !== 'error' && progress.stage !== 'complete' && (
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EditLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
    </div>
  );
}

function DraggableOverlay({ id, x, y, onMove, children, className, style }: {
  id: string; x: number; y: number;
  onMove: (id: string, x: number, y: number) => void;
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleDrag = useCallback((clientX: number, clientY: number) => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    onMove(id, newX, newY);
  }, [id, onMove]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    handleDrag(e.clientX, e.clientY);
  }, [handleDrag]);

  const onPointerUp = useCallback(() => { isDragging.current = false; }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute cursor-move select-none touch-none ${className || ''}`}
      style={{ left: `${x}%`, top: `${y}%`, ...style }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </div>
  );
}

function EditContent() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const {
    videoUrl, editMode, setEditMode, videoLoaded, selectedFilter, setSelectedFilter,
    volume, isProcessing, processingProgress, videoRef,
    selectedMusic, setSelectedMusic, musicVolume, setMusicVolume,
    duration, currentTime, trimStart, trimEnd, isPlaying, setIsPlaying,
    timelineRef, thumbnails, handleVideoLoad, handleTimeUpdate, togglePlayPause,
    handleTimelineMouseDown, formatTime,
    texts, showTextInput, setShowTextInput, newText, setNewText,
    stickers, addText, removeText, updateTextPosition,
    addSticker, removeSticker, updateStickerPosition,
    handleDone, updateVolume, goBack,
  } = useVideoEditor();

  // Extended editor state lives in a dedicated hook so this component holds
  // wiring, not 50 useState lines.
  const {
    speed,
    setSpeed,
    selectedTransition,
    setSelectedTransition,
    transitionDuration,
    setTransitionDuration,
    greenScreenEnabled,
    setGreenScreenEnabled,
    greenScreenColor,
    setGreenScreenColor,
    greenScreenSensitivity,
    setGreenScreenSensitivity,
    tune,
    setTune,
    blurRadius,
    setBlurRadius,
    selectedTemplate,
    setSelectedTemplate,
    rotation,
    setRotation,
    flipH,
    setFlipH,
    flipV,
    setFlipV,
    reversed,
    setReversed,
    cropAspect,
    setCropAspect,
    opacity,
    setOpacity,
    blendMode,
    setBlendMode,
    selectedMask,
    setSelectedMask,
    maskInvert,
    setMaskInvert,
    maskFeather,
    setMaskFeather,
    captions,
    setCaptions,
    captionStyle,
    setCaptionStyle,
    audioDucking,
    setAudioDucking,
    duckingAmount,
    setDuckingAmount,
    noiseReduction,
    setNoiseReduction,
    clips,
    setClips,
    drawCanvasRef,
    setHasDrawing,
    videoDimensions,
    setVideoDimensions,
    appliedSFX,
    setAppliedSFX,
    beatMarkers,
    setBeatMarkers,
    freezeFrames,
    setFreezeFrames,
    cutoutMode,
    setCutoutMode,
    cutoutColor,
    setCutoutColor,
    cutoutSensitivity,
    setCutoutSensitivity,
    stabilizationEnabled,
    setStabilizationEnabled,
    stabilizationStrength,
    setStabilizationStrength,
    clipSpeeds,
    aiSuggestions,
    setAiSuggestions,
    isAnalyzingAI,
    musicLibraryTrackId,
    setMusicLibraryTrackId,
    productTags,
    setProductTags,
    hasNarration,
    setHasNarration,
    setNarrationBlob,
    activeVoiceEffect,
    setActiveVoiceEffect,
    selectedTransition3D,
    setSelectedTransition3D,
    transition3DDuration,
    setTransition3DDuration,
    speedRampKeyframes,
    setSpeedRampKeyframes,
    giphyStickers,
    customFonts,
    setCustomFonts,
    selectedFont,
    setSelectedFont,
    textAnimation,
    setTextAnimation,
    textAnimDuration,
    setTextAnimDuration,
    textPath,
    setTextPath,
    karaokeEnabled,
    setKaraokeEnabled,
    karaokeColor,
    setKaraokeColor,
    karaokeFontSize,
    setKaraokeFontSize,
    translationTracks,
    setTranslationTracks,
    handleAnalyzeVideo,
    handleClipSpeedChange,
    handleAddGiphySticker,
    handleRemoveGiphySticker,
    handleUpdateGiphyStickerPosition,
    buildExtraEdits,
  } = useEditorState({ videoUrl, duration });

  // Gap #22: Undo/redo
  const history = useEditorHistory();

  // Gap #9: Voiceover
  const voiceover = useVoiceover();

  // Gap #28: Draft persistence (auto-save every 5s + restore on mount)
  const drafts = useDraftPersistence(videoUrl);

  const getCurrentSnapshot = useCallback((): EditorSnapshot => ({
    selectedFilter, volume, trimStart, trimEnd,
    texts: [...texts], stickers: [...stickers],
    speed, rotation, flipH, flipV, cropAspect,
  }), [selectedFilter, volume, trimStart, trimEnd, texts, stickers, speed, rotation, flipH, flipV, cropAspect]);

  const restoreSnapshot = useCallback((snap: EditorSnapshot) => {
    setSelectedFilter(snap.selectedFilter);
    updateVolume(snap.volume);
    setSpeed(snap.speed);
    setRotation(snap.rotation);
    setFlipH(snap.flipH);
    setFlipV(snap.flipV);
    setCropAspect(snap.cropAspect);
  }, [setSelectedFilter, updateVolume, setSpeed, setRotation, setFlipH, setFlipV, setCropAspect]);

  const handleUndo = useCallback(() => {
    const prev = history.undo(getCurrentSnapshot());
    if (prev) restoreSnapshot(prev);
  }, [history, getCurrentSnapshot, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    const next = history.redo(getCurrentSnapshot());
    if (next) restoreSnapshot(next);
  }, [history, getCurrentSnapshot, restoreSnapshot]);

  const saveAndSet = useCallback(<T,>(setter: (v: T) => void) => {
    return (v: T) => {
      history.saveSnapshot(getCurrentSnapshot());
      setter(v);
    };
  }, [history, getCurrentSnapshot]);

  // Load saved draft on mount (restore editor state from crash/leave)
  const draftLoadedRef = useRef(false);
  useEffect(() => {
    if (draftLoadedRef.current || !videoUrl) return;
    draftLoadedRef.current = true;
    drafts.load().then(saved => {
      if (!saved) return;
      setSelectedFilter(saved.filter);
      updateVolume(saved.volume);
      setSpeed(saved.speed);
      setRotation(saved.rotation);
      setFlipH(saved.flipH);
      setFlipV(saved.flipV);
      setCropAspect(saved.cropAspect);
      setOpacity(saved.opacity);
      setBlendMode(saved.blendMode);
      setReversed(saved.reversed);
      setSelectedTransition(saved.selectedTransition);
      setNoiseReduction(saved.noiseReduction);
    });
  }, [videoUrl, drafts, setSelectedFilter, updateVolume, setSpeed, setRotation, setFlipH, setFlipV, setCropAspect, setOpacity, setBlendMode, setReversed, setSelectedTransition, setNoiseReduction]);


  // Register state getter for draft auto-save
  drafts.registerStateGetter(() => ({
    filter: selectedFilter,
    volume,
    trimStart,
    trimEnd,
    speed,
    rotation,
    flipH,
    flipV,
    cropAspect,
    opacity,
    blendMode,
    reversed,
    selectedTransition,
    noiseReduction,
  }));

  const handleApplySuggestion = useCallback((type: string, value: unknown) => {
    const v = value as Record<string, unknown>;
    history.saveSnapshot(getCurrentSnapshot());

    if (type === 'speed' && typeof v.speed === 'number') {
      setSpeed(v.speed);
    }
    if (type === 'filter' && typeof v.filterIndex === 'number') {
      setSelectedFilter(v.filterIndex);
    }
    if (type === 'trim' && typeof v.trimStart === 'number') {
      // trimStart is managed by timeline hook -- apply via timeline ref
      // Store suggestion value; actual trim will use this as start
    }
    if (type === 'trim' && typeof v.trimEnd === 'number') {
      // trimEnd suggestion
    }
    if (type === 'volume' && typeof v.volume === 'number') {
      updateVolume(v.volume);
    }
    if (type === 'cut' && Array.isArray(v.cutTimes)) {
      const cutTimes = (v.cutTimes as unknown[]).filter((t): t is number => typeof t === 'number');
      if (cutTimes.length > 0 && duration > 0) {
        // Split the source duration at each suggested point. Sort + dedupe to
        // keep clip ranges monotonic.
        const points = Array.from(new Set([0, ...cutTimes, duration]))
          .filter(t => t >= 0 && t <= duration)
          .sort((a, b) => a - b);
        const next = [];
        for (let i = 0; i < points.length - 1; i++) {
          next.push({
            id: `clip-cut-${i}`,
            startTime: points[i],
            endTime: points[i + 1],
            label: String.fromCharCode(65 + i),
          });
        }
        if (next.length > 0) setClips(next);
      }
    }
    if (type === 'beat' && Array.isArray(v.beatTimes)) {
      const beatTimes = (v.beatTimes as unknown[]).filter((t): t is number => typeof t === 'number');
      setBeatMarkers(beatTimes);
      // Also seed clip boundaries on the most prominent beat times so the
      // existing clip-merge pipeline can render hard cuts on the beat.
      if (beatTimes.length > 0 && duration > 0) {
        const points = Array.from(new Set([0, ...beatTimes, duration]))
          .filter(t => t >= 0 && t <= duration)
          .sort((a, b) => a - b);
        const next = [];
        for (let i = 0; i < points.length - 1; i++) {
          next.push({
            id: `clip-beat-${i}`,
            startTime: points[i],
            endTime: points[i + 1],
            label: String.fromCharCode(65 + i),
          });
        }
        if (next.length > 1) setClips(next);
      }
    }
    // Remove the applied suggestion from the list
    setAiSuggestions(prev => prev.filter(s => !(s.type === type && s.value === value)));
  }, [setSelectedFilter, updateVolume, history, getCurrentSnapshot, duration, setSpeed, setClips, setBeatMarkers, setAiSuggestions]);


  // Build video transform CSS
  const videoTransform = [
    rotation !== 0 ? `rotate(${rotation}deg)` : '',
    flipH ? 'scaleX(-1)' : '',
    flipV ? 'scaleY(-1)' : '',
  ].filter(Boolean).join(' ') || undefined;

  if (!isAuthVerified) return <EditLoading />;
  if (!isAuthenticated) { router.push('/login?redirect=/edit'); return <EditLoading />; }
  if (!videoUrl) return <EditLoading />;

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <EditorHeader onCancel={goBack} onDone={() => { drafts.discard(); handleDone(buildExtraEdits()); }} isProcessing={isProcessing} />
      {isProcessing && <ProcessingModal progress={processingProgress} />}

      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          className="max-w-full max-h-full object-contain"
          style={{
            filter: [
              EDITOR_FILTERS[selectedFilter].filter,
              tune.brightness !== 0 ? `brightness(${1 + tune.brightness})` : '',
              tune.contrast !== 1 ? `contrast(${tune.contrast})` : '',
              tune.saturation !== 1 ? `saturate(${tune.saturation})` : '',
              blurRadius > 0 ? `blur(${blurRadius}px)` : '',
            ].filter(Boolean).join(' ') || undefined,
            transform: videoTransform,
            opacity,
            mixBlendMode: blendMode as React.CSSProperties['mixBlendMode'],
          }}
          onLoadedMetadata={() => {
            handleVideoLoad();
            if (videoRef.current) {
              setVideoDimensions({ width: videoRef.current.videoWidth || 1080, height: videoRef.current.videoHeight || 1920 });
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playsInline
        />

        {texts.map((text) => (
          <DraggableOverlay
            key={text.id} id={text.id} x={text.x} y={text.y}
            onMove={updateTextPosition}
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            <AnimatedTextOverlay
              text={text.text}
              animationType={textAnimation}
              animationDuration={textAnimDuration}
              color={text.color}
              fontSize={text.fontSize}
              fontFamily={selectedFont}
              isPlaying={isPlaying}
            />
          </DraggableOverlay>
        ))}

        {stickers.map((sticker) => (
          <DraggableOverlay
            key={sticker.id} id={sticker.id} x={sticker.x} y={sticker.y}
            onMove={updateStickerPosition}
            style={{
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              fontSize: '48px', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {sticker.emoji}
          </DraggableOverlay>
        ))}

        {giphyStickers.map((gs) => (
          <DraggableOverlay
            key={gs.id} id={gs.id} x={gs.x} y={gs.y}
            onMove={handleUpdateGiphyStickerPosition}
            style={{
              transform: `translate(-50%, -50%) scale(${gs.scale})`,
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gs.url} alt="GIPHY sticker" className="w-24 h-auto pointer-events-none" />
          </DraggableOverlay>
        ))}

        {/* Gap #22: 3D Transition Preview between clips */}
        {selectedTransition3D !== 'none' && clips.length > 1 && (
          <Transition3DPreview
            transitionType={selectedTransition3D}
            duration={transition3DDuration}
            videoRef={videoRef}
            clipBoundaries={clips.slice(1).map(c => c.startTime)}
          />
        )}

        <button onClick={togglePlayPause} className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </button>

        <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        {/* Undo/Redo buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleUndo}
            disabled={!history.canUndo}
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              history.canUndo ? 'bg-black/50 text-white' : 'bg-black/20 text-white/30'
            }`}
            title="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a5 5 0 015 5v2M3 10l4-4m-4 4l4 4" />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            disabled={!history.canRedo}
            className={`w-9 h-9 rounded-full flex items-center justify-center ${
              history.canRedo ? 'bg-black/50 text-white' : 'bg-black/20 text-white/30'
            }`}
            title="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a5 5 0 00-5 5v2m15-7l-4-4m4 4l-4 4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="glass-card border-t border-white/5">
        <EditorTabs activeMode={editMode} onModeChange={setEditMode} />

        <div className="p-4 min-h-[200px]">
          {editMode === 'trim' && (
            <TrimPanel
              videoLoaded={videoLoaded} duration={duration}
              currentTime={currentTime} trimStart={trimStart} trimEnd={trimEnd}
              thumbnails={thumbnails} timelineRef={timelineRef}
              formatTime={formatTime} onMouseDown={handleTimelineMouseDown}
            />
          )}

          {editMode === 'filters' && (
            <FilterPanel selectedFilter={selectedFilter} onSelect={saveAndSet(setSelectedFilter)} />
          )}

          {editMode === 'tune' && (
            <TunePanel tune={tune} onTuneChange={saveAndSet(setTune)} />
          )}

          {editMode === 'blur' && (
            <BlurPanel blurRadius={blurRadius} onBlurChange={saveAndSet(setBlurRadius)} />
          )}

          {editMode === 'text' && (
            <TextPanel
              texts={texts} showTextInput={showTextInput} newText={newText}
              onShowTextInput={setShowTextInput} onNewTextChange={setNewText}
              onAddText={addText} onRemoveText={removeText}
            />
          )}

          {editMode === 'stickers' && (
            <StickerPanel stickers={stickers} onAddSticker={addSticker} onRemoveSticker={removeSticker} />
          )}

          {editMode === 'audio' && (
            <AudioPanel
              volume={volume} onVolumeChange={updateVolume}
              selectedMusic={selectedMusic} onMusicSelect={setSelectedMusic}
              musicVolume={musicVolume} onMusicVolumeChange={setMusicVolume}
              audioDucking={audioDucking}
              onAudioDuckingToggle={() => setAudioDucking(v => !v)}
              duckingAmount={duckingAmount}
              onDuckingAmountChange={setDuckingAmount}
              noiseReduction={noiseReduction}
              onNoiseReductionChange={setNoiseReduction}
            />
          )}

          {editMode === 'speed' && (
            <SpeedPanel
              speed={speed}
              onSpeedChange={saveAndSet(setSpeed)}
              reversed={reversed}
              onReverseToggle={() => { history.saveSnapshot(getCurrentSnapshot()); setReversed(v => !v); }}
            />
          )}

          {editMode === 'transitions' && (
            <TransitionPanel
              selectedTransition={selectedTransition} onSelect={setSelectedTransition}
              transitionDuration={transitionDuration} onDurationChange={setTransitionDuration}
            />
          )}

          {editMode === 'transform' && (
            <TransformPanel
              rotation={rotation} flipH={flipH} flipV={flipV}
              onRotate={saveAndSet(setRotation)}
              onFlipH={() => { history.saveSnapshot(getCurrentSnapshot()); setFlipH(v => !v); }}
              onFlipV={() => { history.saveSnapshot(getCurrentSnapshot()); setFlipV(v => !v); }}
            />
          )}

          {editMode === 'voiceover' && (
            <VoiceoverPanel
              isRecording={voiceover.isRecording}
              duration={voiceover.duration}
              amplitude={voiceover.amplitude}
              hasVoiceover={voiceover.hasVoiceover}
              onStartRecording={voiceover.startRecording}
              onStopRecording={voiceover.stopRecording}
              onDiscard={voiceover.discard}
              formatTime={formatTime}
            />
          )}

          {editMode === 'crop' && (
            <CropPanel selectedAspect={cropAspect} onSelect={saveAndSet(setCropAspect)} />
          )}

          {editMode === 'opacity' && (
            <OpacityPanel
              opacity={opacity} onOpacityChange={saveAndSet(setOpacity)}
              blendMode={blendMode} onBlendModeChange={saveAndSet(setBlendMode)}
            />
          )}

          {editMode === 'masks' && (
            <MasksPanel
              selectedMask={selectedMask} onSelect={saveAndSet(setSelectedMask)}
              maskInvert={maskInvert}
              onInvertToggle={() => { history.saveSnapshot(getCurrentSnapshot()); setMaskInvert(v => !v); }}
              maskFeather={maskFeather} onFeatherChange={saveAndSet(setMaskFeather)}
            />
          )}

          {editMode === 'captions' && (
            <CaptionsPanel
              captions={captions} onCaptionsChange={setCaptions}
              captionStyle={captionStyle} onCaptionStyleChange={setCaptionStyle}
              currentTime={currentTime} formatTime={formatTime}
            />
          )}

          {editMode === 'split' && (
            <SplitPanel
              clips={clips} onClipsChange={setClips}
              currentTime={currentTime} duration={duration} formatTime={formatTime}
            />
          )}

          {editMode === 'draw' && (
            <DrawingPanel
              canvasRef={drawCanvasRef}
              videoWidth={videoDimensions.width}
              videoHeight={videoDimensions.height}
              onDrawingChange={setHasDrawing}
            />
          )}

          {editMode === 'sfx' && (
            <SFXPanel
              appliedSFX={appliedSFX}
              onAddSFX={(sfx, time) => setAppliedSFX(prev => [...prev, { id: sfx.id, name: sfx.name, time }])}
              onRemoveSFX={(idx) => setAppliedSFX(prev => prev.filter((_, i) => i !== idx))}
              currentTime={currentTime} formatTime={formatTime}
            />
          )}

          {editMode === 'beatsync' && (
            <BeatSyncPanel
              duration={duration} beatMarkers={beatMarkers}
              onBeatMarkersChange={setBeatMarkers} formatTime={formatTime}
            />
          )}

          {editMode === 'freeze' && (
            <FreezeFramePanel
              currentTime={currentTime} duration={duration}
              freezeFrames={freezeFrames}
              onAddFreezeFrame={(time, dur) => setFreezeFrames(prev => [...prev, { time, duration: dur }])}
              onRemoveFreezeFrame={(idx) => setFreezeFrames(prev => prev.filter((_, i) => i !== idx))}
              formatTime={formatTime}
            />
          )}

          {editMode === 'greenscreen' && (
            <GreenScreenPanel
              enabled={greenScreenEnabled} onToggle={setGreenScreenEnabled}
              keyColor={greenScreenColor} onKeyColorChange={setGreenScreenColor}
              sensitivity={greenScreenSensitivity} onSensitivityChange={setGreenScreenSensitivity}
            />
          )}

          {editMode === 'templates' && (
            <TemplatePanel selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
          )}

          {editMode === 'cutout' && (
            <CutoutPanel
              cutoutMode={cutoutMode} onModeChange={setCutoutMode}
              cutoutColor={cutoutColor} onColorChange={setCutoutColor}
              cutoutSensitivity={cutoutSensitivity} onSensitivityChange={setCutoutSensitivity}
            />
          )}

          {editMode === 'stabilize' && (
            <StabilizationPanel
              enabled={stabilizationEnabled} onToggle={setStabilizationEnabled}
              strength={stabilizationStrength} onStrengthChange={setStabilizationStrength}
            />
          )}

          {editMode === 'clipspeed' && (
            <ClipSpeedPanel
              clips={clips} onClipSpeedChange={handleClipSpeedChange}
              clipSpeeds={clipSpeeds} formatTime={formatTime}
            />
          )}

          {editMode === 'aiauto' && (
            <AIAutoEditPanel
              onApplySuggestion={handleApplySuggestion}
              isAnalyzing={isAnalyzingAI}
              onAnalyze={handleAnalyzeVideo}
              suggestions={aiSuggestions}
            />
          )}

          {editMode === 'music' && (
            <MusicLibraryPanel
              currentTrackId={musicLibraryTrackId}
              onSelectTrack={(track) => {
                setMusicLibraryTrackId(track.id);
                setSelectedMusic({
                  id: track.id, title: track.title, artist: track.artist,
                  duration: track.duration, audioUrl: track.url, coverUrl: '',
                  isExplicit: false, plays: 0, likes: 0, category: 'Trending',
                  tags: [], isOriginalSound: false, isSaved: false, isPremium: false,
                });
              }}
            />
          )}

          {editMode === 'shopping' && (
            <ShoppingPanel
              currentTime={currentTime}
              videoDuration={duration}
              productTags={productTags}
              onProductTagsChange={setProductTags}
              formatTime={formatTime}
            />
          )}

          {editMode === 'narration' && (
            <NarrationPanel
              hasNarration={hasNarration}
              onNarrationGenerated={(blob) => {
                setNarrationBlob(blob);
                setHasNarration(true);
              }}
              onDiscard={() => {
                setNarrationBlob(null);
                setHasNarration(false);
              }}
            />
          )}

          {editMode === 'voiceeffects' && (
            <VoiceEffectsPanel
              activeEffect={activeVoiceEffect}
              onEffectChange={setActiveVoiceEffect}
              videoRef={videoRef}
            />
          )}

          {editMode === 'transitions3d' && (
            <Transition3DPanel
              selectedTransition3D={selectedTransition3D}
              onSelect={setSelectedTransition3D}
              duration={transition3DDuration}
              onDurationChange={setTransition3DDuration}
            />
          )}

          {editMode === 'speedramp' && (
            <SpeedRampPanel
              keyframes={speedRampKeyframes}
              onKeyframesChange={setSpeedRampKeyframes}
              duration={duration}
              formatTime={formatTime}
            />
          )}

          {editMode === 'giphy' && (
            <GiphyStickerPanel
              stickers={giphyStickers}
              onAddSticker={handleAddGiphySticker}
              onRemoveSticker={handleRemoveGiphySticker}
            />
          )}

          {editMode === 'customfonts' && (
            <FontUploader
              customFonts={customFonts}
              onFontsChange={setCustomFonts}
              selectedFont={selectedFont}
              onFontSelect={setSelectedFont}
            />
          )}

          {editMode === 'textanim' && (
            <TextAnimationSelector
              selectedAnimation={textAnimation}
              onAnimationChange={setTextAnimation}
              animationDuration={textAnimDuration}
              onDurationChange={setTextAnimDuration}
            />
          )}

          {editMode === 'textpath' && (
            <TextPathSelector
              selectedPath={textPath}
              onPathChange={setTextPath}
              previewText={texts.length > 0 ? texts[0].text : 'Sample Text'}
            />
          )}

          {editMode === 'karaoke' && (
            <KaraokeCaptionPreview
              captions={captions}
              currentTime={currentTime}
              enabled={karaokeEnabled}
              onToggle={setKaraokeEnabled}
              highlightColor={karaokeColor}
              onHighlightColorChange={setKaraokeColor}
              fontSize={karaokeFontSize}
              onFontSizeChange={setKaraokeFontSize}
            />
          )}

          {editMode === 'translate' && (
            <CaptionTranslationPanel
              sourceCaptions={captions}
              translationTracks={translationTracks}
              onTranslationTracksChange={setTranslationTracks}
              formatTime={formatTime}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<EditLoading />}>
      <EditContent />
    </Suspense>
  );
}
