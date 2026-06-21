'use client';

import { useMemo } from 'react';
import { isIdentityCurves } from '@/utils/curves';
import {
  EditorTabs, TrimPanel, FilterPanel, TunePanel, CurvesPanel, VignettePanel, GrainPanel, BlurPanel,
  TextPanel, AudioPanel, StickerPanel, SpeedPanel, TransitionPanel,
  GreenScreenPanel, TemplatePanel, TransformPanel, VoiceoverPanel, CropPanel,
  OpacityPanel, MasksPanel, CaptionsPanel, SplitPanel, DrawingPanel, SFXPanel,
  BeatSyncPanel, FreezeFramePanel, CutoutPanel, StabilizationPanel,
  ClipSpeedPanel, AIAutoEditPanel, MusicLibraryPanel,
  ShoppingPanel, NarrationPanel,
  VoiceEffectsPanel, Transition3DPanel, SpeedRampPanel, GiphyStickerPanel,
  FontUploader, TextAnimationSelector, TextPathSelector,
  KaraokeCaptionPreview, CaptionTranslationPanel,
} from '@/components/edit';
import type { useEditorState } from '@/hooks/videoEditor/useEditorState';
import type { useVideoEditor } from '@/hooks/useVideoEditor';
import type { useEditorHistory, EditorSnapshot } from '@/hooks/videoEditor';
import type { useVoiceover } from '@/hooks/videoEditor/useVoiceover';

interface EditorPanelsProps {
  editor: ReturnType<typeof useEditorState>;
  base: ReturnType<typeof useVideoEditor>;
  history: ReturnType<typeof useEditorHistory>;
  voiceover: ReturnType<typeof useVoiceover>;
  saveAndSet: <T>(setter: (v: T) => void) => (v: T) => void;
  getCurrentSnapshot: () => EditorSnapshot;
  handleApplySuggestion: (type: string, value: unknown) => void;
}

/**
 * The editor's mode-switched control panels (38 of them). Pulled out of the
 * edit page so the page holds the preview + cross-cutting wiring, and this
 * holds the panel matrix. Receives the editor-state and base-editor bags
 * whole, plus the few page-level helpers the panels invoke.
 */
export function EditorPanels({
  editor, base, history, voiceover, saveAndSet, getCurrentSnapshot, handleApplySuggestion,
}: EditorPanelsProps) {
  const {
    speed, setSpeed, selectedTransition, setSelectedTransition, transitionDuration, setTransitionDuration,
    greenScreenEnabled, setGreenScreenEnabled, greenScreenColor, setGreenScreenColor, greenScreenSensitivity, setGreenScreenSensitivity,
    tune, setTune, curves, setCurves, filterIntensity, setFilterIntensity, vignette, setVignette, grain, setGrain, blurRadius, setBlurRadius, selectedTemplate, setSelectedTemplate,
    rotation, setRotation, flipH, setFlipH, flipV, setFlipV,
    reversed, setReversed, cropAspect, setCropAspect, opacity, setOpacity,
    blendMode, setBlendMode, selectedMask, setSelectedMask, maskInvert, setMaskInvert,
    maskFeather, setMaskFeather, captions, setCaptions, captionStyle, setCaptionStyle,
    audioDucking, setAudioDucking, duckingAmount, setDuckingAmount, noiseReduction, setNoiseReduction,
    clips, setClips, drawCanvasRef, setHasDrawing, appliedSFX, setAppliedSFX,
    beatMarkers, setBeatMarkers, freezeFrames, setFreezeFrames, cutoutMode, setCutoutMode,
    cutoutColor, setCutoutColor, cutoutSensitivity, setCutoutSensitivity, stabilizationEnabled, setStabilizationEnabled,
    stabilizationStrength, setStabilizationStrength, clipSpeeds, aiSuggestions, isAnalyzingAI, musicLibraryTrackId,
    setMusicLibraryTrackId, productTags, setProductTags, hasNarration, setHasNarration, setNarrationBlob,
    activeVoiceEffect, setActiveVoiceEffect, selectedTransition3D, setSelectedTransition3D, transition3DDuration, setTransition3DDuration,
    speedRampKeyframes, setSpeedRampKeyframes, giphyStickers, customFonts, setCustomFonts, selectedFont,
    setSelectedFont, textAnimation, setTextAnimation, textAnimDuration, setTextAnimDuration, textPath,
    setTextPath, textStyle, setTextStyle, karaokeEnabled, setKaraokeEnabled, karaokeColor, setKaraokeColor, karaokeFontSize,
    setKaraokeFontSize, translationTracks, setTranslationTracks, handleAnalyzeVideo, handleClipSpeedChange, handleAddGiphySticker,
    handleRemoveGiphySticker, videoDimensions,
  } = editor;
  const {
    editMode, setEditMode, videoLoaded, selectedFilter, setSelectedFilter, volume,
    updateVolume, selectedMusic, setSelectedMusic, musicVolume, setMusicVolume, duration,
    currentTime, trimStart, trimEnd, timelineRef, thumbnails, handleTimelineMouseDown,
    formatTime, texts, showTextInput, setShowTextInput, newText, setNewText,
    stickers, addText, removeText, addSticker, removeSticker, videoRef,
  } = base;

  // Tabs with a non-default adjustment applied get a dot indicator.
  const modifiedModes = useMemo(() => {
    const s = new Set<string>();
    if (selectedFilter !== 0) s.add('filters');
    if (tune.brightness !== 0 || tune.contrast !== 1 || tune.saturation !== 1 || tune.exposure !== 0) s.add('tune');
    if (!isIdentityCurves(curves)) s.add('curves');
    if (vignette > 0) s.add('vignette');
    if (grain > 0) s.add('grain');
    if (blurRadius > 0) s.add('blur');
    if (speed !== 1 || reversed) s.add('speed');
    if (selectedTransition !== 'none') s.add('transitions');
    if (selectedTransition3D !== 'none') s.add('transitions3d');
    if (rotation !== 0 || flipH || flipV) s.add('transform');
    if (cropAspect) s.add('crop');
    if (opacity < 1 || blendMode !== 'normal') s.add('opacity');
    if (selectedMask) s.add('masks');
    if (texts.length > 0 || textStyle !== 'shadow') s.add('text');
    if (stickers.length > 0) s.add('stickers');
    if (giphyStickers.length > 0) s.add('giphy');
    if (audioDucking || noiseReduction > 0) s.add('audio');
    if (cutoutMode !== 'off') s.add('cutout');
    if (stabilizationEnabled) s.add('stabilize');
    if (beatMarkers.length > 0) s.add('beatsync');
    if (freezeFrames.length > 0) s.add('freeze');
    if (speedRampKeyframes.length >= 2) s.add('speedramp');
    if (activeVoiceEffect) s.add('voiceeffects');
    if (captions.length > 0) s.add('captions');
    if (translationTracks.length > 0) s.add('translate');
    if (karaokeEnabled) s.add('karaoke');
    if (hasNarration) s.add('narration');
    if (productTags.length > 0) s.add('shopping');
    if (selectedTemplate) s.add('templates');
    if (musicLibraryTrackId) s.add('music');
    return s;
  }, [selectedFilter, tune, curves, vignette, grain, blurRadius, speed, reversed, selectedTransition, selectedTransition3D, rotation, flipH, flipV, cropAspect, opacity, blendMode, selectedMask, texts, textStyle, stickers, giphyStickers, audioDucking, noiseReduction, cutoutMode, stabilizationEnabled, beatMarkers, freezeFrames, speedRampKeyframes, activeVoiceEffect, captions, translationTracks, karaokeEnabled, hasNarration, productTags, selectedTemplate, musicLibraryTrackId]);

  return (
      <div className="glass-card border-t border-white/5">
        <EditorTabs activeMode={editMode} onModeChange={setEditMode} modifiedModes={modifiedModes} />

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
            <FilterPanel
              selectedFilter={selectedFilter}
              onSelect={saveAndSet(setSelectedFilter)}
              intensity={filterIntensity}
              onIntensityChange={setFilterIntensity}
            />
          )}

          {editMode === 'tune' && (
            <TunePanel tune={tune} onTuneChange={saveAndSet(setTune)} />
          )}

          {editMode === 'curves' && (
            <CurvesPanel curves={curves} onCurvesChange={saveAndSet(setCurves)} />
          )}

          {editMode === 'vignette' && (
            <VignettePanel strength={vignette} onStrengthChange={saveAndSet(setVignette)} />
          )}

          {editMode === 'grain' && (
            <GrainPanel strength={grain} onStrengthChange={saveAndSet(setGrain)} />
          )}

          {editMode === 'blur' && (
            <BlurPanel blurRadius={blurRadius} onBlurChange={saveAndSet(setBlurRadius)} />
          )}

          {editMode === 'text' && (
            <TextPanel
              texts={texts} showTextInput={showTextInput} newText={newText}
              onShowTextInput={setShowTextInput} onNewTextChange={setNewText}
              onAddText={addText} onRemoveText={removeText}
              textStyle={textStyle} onTextStyleChange={saveAndSet(setTextStyle)}
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
  );
}
