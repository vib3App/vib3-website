'use client';

import type { CameraKitLens } from '@/hooks/camera/useCameraKit';
import { EFFECT_CATEGORIES, type EffectCategoryId } from '@/config/cameraKit';
import { useState } from 'react';
import Image from 'next/image';

/** Placeholder effects when Camera Kit is not loaded */
const PLACEHOLDER_EFFECTS: Record<EffectCategoryId, { id: string; name: string }[]> = {
  'green-screen': [
    { id: 'gs-beach', name: 'Beach' },
    { id: 'gs-space', name: 'Space' },
    { id: 'gs-city', name: 'City' },
  ],
  beauty: [
    { id: 'b-smooth', name: 'Smooth' },
    { id: 'b-glow', name: 'Glow' },
    { id: 'b-slim', name: 'Slim' },
  ],
  masks: [
    { id: 'm-cat', name: 'Cat' },
    { id: 'm-dog', name: 'Dog' },
    { id: 'm-crown', name: 'Crown' },
  ],
  fun: [
    { id: 'f-big-eyes', name: 'Big Eyes' },
    { id: 'f-tiny-face', name: 'Tiny Face' },
    { id: 'f-cartoon', name: 'Cartoon' },
  ],
  effects: [
    { id: 'e-rain', name: 'Rain' },
    { id: 'e-neon', name: 'Neon' },
    { id: 'e-glitch', name: 'Glitch' },
  ],
};

const CATEGORY_ICONS: Record<string, string> = {
  screen: '\u{1F7E9}',  // green square
  sparkle: '\u2728',     // sparkles
  mask: '\u{1F3AD}',     // masks
  smile: '\u{1F604}',    // grinning face
  wand: '\u{1FA84}',     // magic wand
};

interface EffectCategoriesPanelProps {
  lenses: CameraKitLens[];
  activeLensId: string | null;
  isCameraKitLoaded: boolean;
  onSelectLens: (lensId: string | null) => void;
}

export function EffectCategoriesPanel({
  lenses, activeLensId, isCameraKitLoaded, onSelectLens,
}: EffectCategoriesPanelProps) {
  const [activeCategory, setActiveCategory] = useState<EffectCategoryId>('beauty');

  // Try to categorize CK lenses by name keywords
  const categorizedLenses = categorizeLenses(lenses);
  const categoryLenses = categorizedLenses[activeCategory] ?? [];

  return (
    <div className="absolute bottom-32 left-0 right-0 z-10 px-2">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide mb-2">
        {EFFECT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? 'bg-purple-500 text-white'
                : 'bg-black/30 text-white/70'
            }`}
          >
            <span className="mr-1">{CATEGORY_ICONS[cat.icon]}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Lenses/effects for selected category */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* None option */}
        <button
          onClick={() => onSelectLens(null)}
          className={`flex-shrink-0 w-16 h-16 rounded-xl bg-black/30 flex flex-col items-center justify-center ${
            activeLensId === null ? 'ring-2 ring-purple-500' : ''
          }`}
        >
          <span className="text-lg">{'\u{1F6AB}'}</span>
          <span className="text-white text-[10px] mt-1">None</span>
        </button>

        {isCameraKitLoaded && categoryLenses.length > 0 ? (
          categoryLenses.map((lens) => (
            <button
              key={lens.id}
              onClick={() => onSelectLens(lens.id)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative ${
                activeLensId === lens.id ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {lens.iconUrl ? (
                <Image
                  src={lens.iconUrl}
                  alt={lens.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-lg">{'\u{1F3AD}'}</span>
                </div>
              )}
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center truncate px-0.5">
                {lens.name}
              </span>
            </button>
          ))
        ) : (
          // Placeholder effects when CK not loaded
          PLACEHOLDER_EFFECTS[activeCategory]?.map((effect) => (
            <button
              key={effect.id}
              disabled
              className="flex-shrink-0 w-16 h-16 rounded-xl bg-black/20 flex flex-col items-center justify-center opacity-50"
            >
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <span className="text-white/50 text-[10px] mt-1">{effect.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/** Simple keyword-based lens categorization */
function categorizeLenses(lenses: CameraKitLens[]): Record<EffectCategoryId, CameraKitLens[]> {
  const result: Record<EffectCategoryId, CameraKitLens[]> = {
    'green-screen': [],
    beauty: [],
    masks: [],
    fun: [],
    effects: [],
  };

  const keywords: Record<EffectCategoryId, string[]> = {
    'green-screen': ['green', 'background', 'bg', 'screen', 'chroma'],
    beauty: ['beauty', 'smooth', 'glow', 'skin', 'face', 'makeup', 'lipstick'],
    masks: ['mask', 'face', 'animal', 'cat', 'dog', 'bear', 'crown'],
    fun: ['funny', 'fun', 'big', 'tiny', 'cartoon', 'distort', 'meme'],
    effects: ['rain', 'neon', 'glitch', 'particle', 'fire', 'snow', 'sparkle'],
  };

  for (const lens of lenses) {
    const name = lens.name.toLowerCase();
    let placed = false;
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some((w) => name.includes(w))) {
        result[category as EffectCategoryId].push(lens);
        placed = true;
        break;
      }
    }
    if (!placed) {
      result.effects.push(lens);
    }
  }

  return result;
}
