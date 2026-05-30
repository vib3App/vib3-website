'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useSlideshow } from '@/hooks/useSlideshow';
import { SlideThumbnail } from '@/components/slideshow/SlideThumbnail';
import type { SlideshowTransition } from '@/services/videoProcessor';

const DURATIONS = [2, 3, 5];
const TRANSITIONS: { id: SlideshowTransition; label: string }[] = [
  { id: 'fade', label: 'Fade' },
  { id: 'slideleft', label: 'Slide' },
  { id: 'circleopen', label: 'Iris' },
  { id: 'wipeleft', label: 'Wipe' },
  { id: 'none', label: 'None' },
];

export default function SlideshowPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const slideshow = useSlideshow();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthVerified && !isAuthenticated) router.push('/login?redirect=/slideshow');
  }, [isAuthenticated, isAuthVerified, router]);

  if (!isAuthVerified) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  const slideCount = slideshow.slides.length;
  const estimatedSeconds = slideCount === 0
    ? 0
    : Math.max(slideCount * slideshow.durationPerSlide - Math.max(0, slideCount - 1) * 0.5, slideshow.durationPerSlide);

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 backdrop-blur bg-black/60 border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white/60 hover:text-white" aria-label="Back">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Photo slideshow</h1>
          </div>
          {slideCount > 0 && (
            <button onClick={slideshow.clear} className="text-xs text-white/50 hover:text-red-400">
              Clear all
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 pb-32 space-y-5">
        {slideshow.errorMessage && (
          <div className="px-3 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">
            {slideshow.errorMessage}
          </div>
        )}

        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm uppercase tracking-wide text-white/50">Slides</h2>
            <span className="text-xs text-white/40">{slideCount}/30</span>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) slideshow.addSlides(e.target.files);
              if (e.target) e.target.value = '';
            }}
          />
          {slideCount === 0 ? (
            <button
              onClick={() => photoInputRef.current?.click()}
              className="w-full aspect-[9/16] max-h-72 rounded-2xl border-2 border-dashed border-white/15 hover:border-purple-500/50 hover:bg-white/5 transition flex flex-col items-center justify-center text-white/40"
            >
              <svg className="w-10 h-10 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 15l4-4a2 2 0 012.83 0L15 16" />
                <circle cx="9" cy="9" r="2" />
              </svg>
              <span className="text-sm">Add photos</span>
              <span className="text-xs mt-1">jpg · png · webp · gif</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slideshow.slides.map((slide, i) => (
                <SlideThumbnail
                  key={slide.id}
                  index={i}
                  total={slideCount}
                  previewUrl={slide.previewUrl}
                  onRemove={() => slideshow.removeSlide(slide.id)}
                  onMoveUp={() => slideshow.moveSlide(slide.id, -1)}
                  onMoveDown={() => slideshow.moveSlide(slide.id, 1)}
                />
              ))}
              {slideCount < 30 && (
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="aspect-[9/16] rounded-xl border-2 border-dashed border-white/15 hover:border-purple-500/50 hover:bg-white/5 transition flex flex-col items-center justify-center text-white/40"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span className="text-[10px] mt-1">Add</span>
                </button>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wide text-white/50 mb-2">Duration per slide</h2>
          <div className="flex gap-2">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => slideshow.setDurationPerSlide(d)}
                className={`flex-1 py-2 rounded-xl text-sm transition ${
                  slideshow.durationPerSlide === d
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {d}s
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wide text-white/50 mb-2">Transition</h2>
          <div className="grid grid-cols-5 gap-2">
            {TRANSITIONS.map(t => (
              <button
                key={t.id}
                onClick={() => slideshow.setTransition(t.id)}
                className={`py-2 rounded-xl text-xs transition ${
                  slideshow.transition === t.id
                    ? 'bg-teal-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-wide text-white/50 mb-2">Music (optional)</h2>
          <input
            ref={musicInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              slideshow.setMusic(file);
              if (e.target) e.target.value = '';
            }}
          />
          {slideshow.music ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/10">
              <span className="text-sm truncate">{slideshow.music.name}</span>
              <button onClick={() => slideshow.setMusic(null)} className="text-xs text-red-400 hover:text-red-300 ml-2">
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => musicInputRef.current?.click()}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm text-white/80 transition"
            >
              + Add music
            </button>
          )}
          {slideshow.music && (
            <div className="mt-2 space-y-2">
              <label className="text-xs text-white/50 flex items-center justify-between mb-1">
                <span>Volume</span>
                <span>{Math.round(slideshow.musicVolume * 100)}%</span>
              </label>
              <input
                type="range" min={0} max={1} step={0.05}
                value={slideshow.musicVolume}
                onChange={e => slideshow.setMusicVolume(parseFloat(e.target.value))}
                className="w-full accent-purple-500"
              />
              <label className="flex items-center justify-between gap-2 text-sm text-white">
                <span>
                  Sync slides to beat
                  {slideshow.beatBpm != null && (
                    <span className="ml-2 text-xs text-teal-400">~{slideshow.beatBpm} BPM detected</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => slideshow.setSyncToBeats(!slideshow.syncToBeats)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    slideshow.syncToBeats ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={slideshow.syncToBeats}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      slideshow.syncToBeats ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              {slideshow.syncToBeats && (
                <p className="text-xs text-white/40">
                  Slide durations follow the music beats so transitions land on the rhythm.
                </p>
              )}
            </div>
          )}
        </section>

        {slideshow.outputUrl && (
          <section>
            <h2 className="text-sm uppercase tracking-wide text-white/50 mb-2">Preview</h2>
            <video src={slideshow.outputUrl} controls className="w-full rounded-xl bg-black" />
          </section>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-20 bg-black/80 backdrop-blur border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-white/50">
            {slideCount > 0 ? `~${estimatedSeconds.toFixed(1)}s total` : 'Add photos to begin'}
          </div>
          <div className="flex gap-2">
            {slideshow.outputUrl && (
              <button
                onClick={slideshow.sendToUpload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 text-white text-sm font-medium"
              >
                Use in upload →
              </button>
            )}
            <button
              onClick={() => void slideshow.render()}
              disabled={slideCount === 0 || slideshow.rendering}
              className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium disabled:opacity-50"
            >
              {slideshow.rendering
                ? slideshow.progress?.message || 'Rendering…'
                : slideshow.outputUrl ? 'Re-render' : 'Render'}
            </button>
          </div>
        </div>
        {slideshow.rendering && slideshow.progress && (
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${slideshow.progress.percent}%` }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
