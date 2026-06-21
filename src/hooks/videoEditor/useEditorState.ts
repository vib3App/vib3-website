'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Clip, AISuggestion, ProductTag, CustomFont } from '@/components/edit';
import type { TuneSettings, CurveSettings } from '@/services/videoProcessor';
import { identityCurves, isIdentityCurves } from '@/utils/curves';
import type { SpeedKeyframe, GiphyStickerOverlay, TextPathType } from '@/hooks/videoEditor/types';
import { analyzeVideoForSuggestions } from '@/services/videoAnalyzer';

export type Caption = { id: string; text: string; startTime: number; endTime: number };
export type TranslationTrack = { language: string; languageLabel: string; captions: Caption[] };

interface UseEditorStateArgs {
  videoUrl: string | null;
  duration: number;
}

/**
 * All of the editor's "extended" state — every adjustable parameter beyond the
 * core trim/filter/text/audio handled by useVideoEditor — plus the self-
 * contained logic that operates purely on it (AI analyze, GIPHY/clip-speed
 * handlers, and the buildExtraEdits export model). Pulled out of the edit page
 * so that god component holds wiring, not 50 useState lines + 120 lines of
 * pure transforms.
 *
 * Returns a flat bag of state, setters, and those handlers; the page
 * destructures what it needs. Cross-cutting logic that also touches the base
 * editor (undo/redo, draft restore, apply-suggestion) stays in the page.
 */
export function useEditorState({ videoUrl, duration }: UseEditorStateArgs) {
  // Speed / transitions
  const [speed, setSpeed] = useState(1);
  const [selectedTransition, setSelectedTransition] = useState('none');
  const [transitionDuration, setTransitionDuration] = useState(0.5);

  // Green screen
  const [greenScreenEnabled, setGreenScreenEnabled] = useState(false);
  const [greenScreenColor, setGreenScreenColor] = useState('#00ff00');
  const [greenScreenSensitivity, setGreenScreenSensitivity] = useState(50);

  // Tune / blur
  const [tune, setTune] = useState<TuneSettings>({ brightness: 0, contrast: 1, saturation: 1, exposure: 0 });
  const [curves, setCurves] = useState<CurveSettings>(identityCurves());
  const [filterIntensity, setFilterIntensity] = useState(1); // 0..1 strength of the selected preset filter
  const [vignette, setVignette] = useState(0); // 0..1 vignette strength
  const [grain, setGrain] = useState(0); // 0..1 film grain strength
  const [blurRadius, setBlurRadius] = useState(0);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Transform
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Reverse / crop
  const [reversed, setReversed] = useState(false);
  const [cropAspect, setCropAspect] = useState<string | null>(null);

  // Opacity / blending
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState('normal');

  // Masks
  const [selectedMask, setSelectedMask] = useState<string | null>(null);
  const [maskInvert, setMaskInvert] = useState(false);
  const [maskFeather, setMaskFeather] = useState(0);

  // Captions
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [captionStyle, setCaptionStyle] = useState('default');

  // Audio ducking / noise
  const [audioDucking, setAudioDucking] = useState(false);
  const [duckingAmount, setDuckingAmount] = useState(70);
  const [noiseReduction, setNoiseReduction] = useState(0);

  // Clips / drawing
  const [clips, setClips] = useState<Clip[]>([]);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [, setHasDrawing] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 1080, height: 1920 });

  // SFX / beat / freeze
  const [appliedSFX, setAppliedSFX] = useState<{ id: string; name: string; time: number }[]>([]);
  const [beatMarkers, setBeatMarkers] = useState<number[]>([]);
  const [freezeFrames, setFreezeFrames] = useState<{ time: number; duration: number }[]>([]);

  // Cutout / BG removal
  const [cutoutMode, setCutoutMode] = useState<'off' | 'auto' | 'colorkey'>('off');
  const [cutoutColor, setCutoutColor] = useState('#00ff00');
  const [cutoutSensitivity, setCutoutSensitivity] = useState(50);

  // Stabilization
  const [stabilizationEnabled, setStabilizationEnabled] = useState(false);
  const [stabilizationStrength, setStabilizationStrength] = useState(2);

  // Per-clip speed
  const [clipSpeeds, setClipSpeeds] = useState<Record<string, number>>({});

  // AI auto-edit
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Music library / shopping / narration
  const [musicLibraryTrackId, setMusicLibraryTrackId] = useState<string | null>(null);
  const [productTags, setProductTags] = useState<ProductTag[]>([]);
  const [hasNarration, setHasNarration] = useState(false);
  const [narrationBlob, setNarrationBlob] = useState<Blob | null>(null);

  // Voice FX
  const [activeVoiceEffect, setActiveVoiceEffect] = useState<string | null>(null);

  // 3D transitions
  const [selectedTransition3D, setSelectedTransition3D] = useState('none');
  const [transition3DDuration, setTransition3DDuration] = useState(0.5);

  // Speed ramp
  const [speedRampKeyframes, setSpeedRampKeyframes] = useState<SpeedKeyframe[]>([]);

  // GIPHY stickers
  const [giphyStickers, setGiphyStickers] = useState<GiphyStickerOverlay[]>([]);

  // Fonts
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [selectedFont, setSelectedFont] = useState('sans-serif');

  // Text animation / path
  const [textAnimation, setTextAnimation] = useState<string | null>(null);
  const [textAnimDuration, setTextAnimDuration] = useState(0.8);
  const [textPath, setTextPath] = useState<TextPathType>('straight');
  const [textStyle, setTextStyle] = useState('shadow'); // shadow | background | outline | none

  // Karaoke captions
  const [karaokeEnabled, setKaraokeEnabled] = useState(false);
  const [karaokeColor, setKaraokeColor] = useState('#facc15');
  const [karaokeFontSize, setKaraokeFontSize] = useState(24);

  // Caption translation
  const [translationTracks, setTranslationTracks] = useState<TranslationTrack[]>([]);

  // Initialize clips from video duration
  useEffect(() => {
    if (duration > 0 && clips.length === 0) {
      setClips([{ id: 'clip-1', startTime: 0, endTime: duration, label: 'A' }]);
    }
  }, [duration, clips.length]);

  // Gap #18: AI auto-edit analyze using real audio analysis
  const handleAnalyzeVideo = useCallback(async () => {
    if (!videoUrl || duration <= 0) return;
    setIsAnalyzingAI(true);
    setAiSuggestions([]);
    try {
      const suggestions = await analyzeVideoForSuggestions(videoUrl, duration);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('AI analysis failed, using defaults:', err);
      setAiSuggestions([
        { id: 'sug-f1', type: 'filter', label: 'Apply cinematic color grade', description: 'Warm tones with lifted shadows for a professional look.', value: { filterIndex: 8 } },
        { id: 'sug-f2', type: 'speed', label: 'Add slow-motion ending', description: 'Slow the last 20% to 0.5x for a dramatic finish.', value: { speed: 0.5, startPercent: 80 } },
        { id: 'sug-f3', type: 'volume', label: 'Normalize audio levels', description: 'Even out quiet and loud sections.', value: { normalize: true } },
      ]);
    } finally {
      setIsAnalyzingAI(false);
    }
  }, [videoUrl, duration]);

  const handleClipSpeedChange = useCallback((clipId: string, clipSpeed: number) => {
    setClipSpeeds(prev => ({ ...prev, [clipId]: clipSpeed }));
  }, []);

  // GIPHY sticker handlers
  const handleAddGiphySticker = useCallback((sticker: Omit<GiphyStickerOverlay, 'id' | 'x' | 'y' | 'scale'>) => {
    setGiphyStickers(prev => [...prev, {
      ...sticker, id: `giphy-${Date.now()}`, x: 50, y: 50, scale: 1,
    }]);
  }, []);

  const handleRemoveGiphySticker = useCallback((id: string) => {
    setGiphyStickers(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleUpdateGiphyStickerPosition = useCallback((id: string, x: number, y: number) => {
    setGiphyStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  }, []);

  // Build extra edits object for the processor pipeline. Pure transform over
  // the extended state above (plus duration); the page passes it to handleDone.
  const buildExtraEdits = useCallback(() => {
    const extras: Record<string, unknown> = {};

    // Gap 18: Tune
    const hasTune = tune.brightness !== 0 || tune.contrast !== 1 || tune.saturation !== 1 || tune.exposure !== 0;
    if (hasTune) extras.tune = tune;

    // Color curves (master + per-channel)
    if (!isIdentityCurves(curves)) extras.curves = curves;

    // Vignette
    if (vignette > 0) extras.vignette = vignette;

    // Film grain
    if (grain > 0) extras.grain = grain;

    // Text style (applies to burned-in text overlays)
    if (textStyle !== 'shadow') extras.textStyle = textStyle;

    // Gap 19: Blur
    if (blurRadius > 0) extras.blur = blurRadius;

    // Gap 29: Crop
    if (cropAspect) {
      extras.crop = { aspect: cropAspect, x: 0, y: 0, width: 1, height: 1 };
    }

    // Gap 30: Transform
    const hasTransform = rotation !== 0 || flipH || flipV;
    if (hasTransform) extras.transform = { rotation, flipH, flipV };

    // Gap 31: Transitions (stored for multi-clip export)
    if (selectedTransition !== 'none' && clips.length > 1) {
      extras.transition = { type: selectedTransition, duration: transitionDuration };
    }

    // Gap 10: 3D transitions (mapped to FFmpeg xfade for export)
    if (selectedTransition3D !== 'none' && clips.length > 1) {
      extras.transition3D = { type: selectedTransition3D, duration: transition3DDuration };
    }

    // Gap 32: Opacity
    if (opacity < 1) extras.opacity = opacity;
    if (blendMode !== 'normal') extras.blendMode = blendMode;

    // Gap 33: Masks
    if (selectedMask) {
      extras.mask = { shape: selectedMask, invert: maskInvert, feather: maskFeather };
    }

    // Gap 34: Freeze frames
    if (freezeFrames.length > 0) extras.freezeFrames = freezeFrames;

    // Per-clip speeds OR a multi-clip layout. Either triggers the merge
    // pre-pass so the export honors the user's order/cuts; single-clip
    // single-speed is a no-op and falls through to the standard pipeline.
    const hasClipSpeeds = Object.values(clipSpeeds).some(s => Math.abs(s - 1) > 0.01);
    const isMultiClip = clips.length > 1;
    const isTrimmedSingleClip = clips.length === 1
      && (clips[0].startTime > 0.01 || clips[0].endTime < duration - 0.01);
    if ((hasClipSpeeds || isMultiClip || isTrimmedSingleClip) && clips.length > 0) {
      extras.clipEdits = clips.map(c => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.endTime,
        speed: clipSpeeds[c.id] ?? 1,
      }));
    }

    // Gap 25: Stabilization (real deshake via FFmpeg)
    if (stabilizationEnabled) {
      extras.stabilization = { enabled: true, strength: stabilizationStrength };
    }

    // Gap 27: Green screen (real colorkey via FFmpeg)
    if (greenScreenEnabled) {
      extras.greenScreen = { enabled: true, color: greenScreenColor, sensitivity: greenScreenSensitivity };
    }

    // Gap 26: Cutout / BG removal (colorkey mode via FFmpeg)
    if (cutoutMode !== 'off') {
      extras.cutout = { mode: cutoutMode, color: cutoutColor, sensitivity: cutoutSensitivity };
    }

    // Gap 11: Speed ramp keyframes
    if (speedRampKeyframes.length >= 2) {
      extras.speedRamp = speedRampKeyframes;
    }

    // Reverse playback (audio + video). Was UI-only before.
    if (reversed) {
      extras.reversed = true;
    }

    // Beat-driven brightness flashes. Was state-only before — now visible
    // in the rendered output. Filter is no-op if BeatSyncPanel produced
    // no markers.
    if (beatMarkers.length > 0) {
      extras.beatMarkers = beatMarkers;
    }

    // Gap 9: Voice effect for export
    if (activeVoiceEffect) {
      extras.voiceEffect = activeVoiceEffect;
    }

    // Gap 37: Narration audio blob for mixing into export
    if (narrationBlob) {
      extras.narrationBlob = narrationBlob;
    }

    // Gap #23: Drawing canvas data for composite overlay
    if (drawCanvasRef.current) {
      try {
        const ctx = drawCanvasRef.current.getContext('2d');
        if (ctx) {
          const imgData = ctx.getImageData(0, 0, drawCanvasRef.current.width, drawCanvasRef.current.height);
          const hasContent = imgData.data.some((v, i) => i % 4 === 3 && v > 0);
          if (hasContent) {
            extras.drawingDataUrl = drawCanvasRef.current.toDataURL('image/png');
          }
        }
      } catch {
        // Canvas tainted or empty, skip
      }
    }

    return extras;
  }, [tune, curves, vignette, grain, textStyle, blurRadius, cropAspect, rotation, flipH, flipV, selectedTransition, transitionDuration, selectedTransition3D, transition3DDuration, clips, duration, opacity, blendMode, selectedMask, maskInvert, maskFeather, freezeFrames, clipSpeeds, stabilizationEnabled, stabilizationStrength, greenScreenEnabled, greenScreenColor, greenScreenSensitivity, cutoutMode, cutoutColor, cutoutSensitivity, speedRampKeyframes, activeVoiceEffect, narrationBlob, reversed, beatMarkers]);

  return {
    speed, setSpeed,
    selectedTransition, setSelectedTransition,
    transitionDuration, setTransitionDuration,
    greenScreenEnabled, setGreenScreenEnabled,
    greenScreenColor, setGreenScreenColor,
    greenScreenSensitivity, setGreenScreenSensitivity,
    tune, setTune,
    curves, setCurves,
    filterIntensity, setFilterIntensity,
    vignette, setVignette,
    grain, setGrain,
    blurRadius, setBlurRadius,
    selectedTemplate, setSelectedTemplate,
    rotation, setRotation,
    flipH, setFlipH,
    flipV, setFlipV,
    reversed, setReversed,
    cropAspect, setCropAspect,
    opacity, setOpacity,
    blendMode, setBlendMode,
    selectedMask, setSelectedMask,
    maskInvert, setMaskInvert,
    maskFeather, setMaskFeather,
    captions, setCaptions,
    captionStyle, setCaptionStyle,
    audioDucking, setAudioDucking,
    duckingAmount, setDuckingAmount,
    noiseReduction, setNoiseReduction,
    clips, setClips,
    drawCanvasRef,
    setHasDrawing,
    videoDimensions, setVideoDimensions,
    appliedSFX, setAppliedSFX,
    beatMarkers, setBeatMarkers,
    freezeFrames, setFreezeFrames,
    cutoutMode, setCutoutMode,
    cutoutColor, setCutoutColor,
    cutoutSensitivity, setCutoutSensitivity,
    stabilizationEnabled, setStabilizationEnabled,
    stabilizationStrength, setStabilizationStrength,
    clipSpeeds, setClipSpeeds,
    aiSuggestions, setAiSuggestions,
    isAnalyzingAI, setIsAnalyzingAI,
    musicLibraryTrackId, setMusicLibraryTrackId,
    productTags, setProductTags,
    hasNarration, setHasNarration,
    narrationBlob, setNarrationBlob,
    activeVoiceEffect, setActiveVoiceEffect,
    selectedTransition3D, setSelectedTransition3D,
    transition3DDuration, setTransition3DDuration,
    speedRampKeyframes, setSpeedRampKeyframes,
    giphyStickers, setGiphyStickers,
    customFonts, setCustomFonts,
    selectedFont, setSelectedFont,
    textAnimation, setTextAnimation,
    textAnimDuration, setTextAnimDuration,
    textPath, setTextPath,
    textStyle, setTextStyle,
    karaokeEnabled, setKaraokeEnabled,
    karaokeColor, setKaraokeColor,
    karaokeFontSize, setKaraokeFontSize,
    translationTracks, setTranslationTracks,
    // Relocated logic (pure over the extended state above)
    handleAnalyzeVideo,
    handleClipSpeedChange,
    handleAddGiphySticker,
    handleRemoveGiphySticker,
    handleUpdateGiphyStickerPosition,
    buildExtraEdits,
  };
}
