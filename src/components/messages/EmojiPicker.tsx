'use client';

import { useState, useCallback } from 'react';

const EMOJI_CATEGORIES: { name: string; icon: string; emojis: string[] }[] = [
  {
    name: 'Smileys',
    icon: '\u{1F600}',
    emojis: [
      '\u{1F600}', '\u{1F603}', '\u{1F604}', '\u{1F601}', '\u{1F606}', '\u{1F605}', '\u{1F602}', '\u{1F923}',
      '\u{1F60A}', '\u{1F607}', '\u{1F642}', '\u{1F643}', '\u{1F609}', '\u{1F60C}', '\u{1F60D}', '\u{1F970}',
      '\u{1F618}', '\u{1F617}', '\u{1F619}', '\u{1F61A}', '\u{1F60B}', '\u{1F61B}', '\u{1F61C}', '\u{1F92A}',
      '\u{1F61D}', '\u{1F911}', '\u{1F917}', '\u{1F92D}', '\u{1F92B}', '\u{1F914}', '\u{1F910}', '\u{1F928}',
      '\u{1F610}', '\u{1F611}', '\u{1F636}', '\u{1F60F}', '\u{1F612}', '\u{1F644}', '\u{1F62C}', '\u{1F925}',
      '\u{1F60E}', '\u{1F913}', '\u{1F9D0}', '\u{1F615}', '\u{1F61F}', '\u{1F641}', '\u{2639}\u{FE0F}', '\u{1F62E}',
    ],
  },
  {
    name: 'Gestures',
    icon: '\u{1F44D}',
    emojis: [
      '\u{1F44D}', '\u{1F44E}', '\u{1F44A}', '\u{270A}', '\u{1F91B}', '\u{1F91C}', '\u{1F44F}', '\u{1F64C}',
      '\u{1F450}', '\u{1F932}', '\u{1F91D}', '\u{1F64F}', '\u{270D}\u{FE0F}', '\u{1F485}', '\u{1F933}', '\u{1F4AA}',
      '\u{1F44B}', '\u{1F91A}', '\u{1F590}\u{FE0F}', '\u{270B}', '\u{1F596}', '\u{1F44C}', '\u{1F90C}', '\u{270C}\u{FE0F}',
      '\u{1F91E}', '\u{1F91F}', '\u{1F918}', '\u{1F919}', '\u{1F448}', '\u{1F449}', '\u{1F446}', '\u{1F447}',
    ],
  },
  {
    name: 'Hearts',
    icon: '\u{2764}\u{FE0F}',
    emojis: [
      '\u{2764}\u{FE0F}', '\u{1F9E1}', '\u{1F49B}', '\u{1F49A}', '\u{1F499}', '\u{1F49C}', '\u{1F5A4}', '\u{1F90D}',
      '\u{1F90E}', '\u{1F498}', '\u{1F49D}', '\u{1F496}', '\u{1F497}', '\u{1F493}', '\u{1F49E}', '\u{1F495}',
      '\u{1F48C}', '\u{1F48B}', '\u{1F48D}', '\u{1F48E}', '\u{1F49F}', '\u{2763}\u{FE0F}', '\u{1F494}', '\u{2764}\u{FE0F}\u{200D}\u{1F525}',
    ],
  },
  {
    name: 'Objects',
    icon: '\u{1F525}',
    emojis: [
      '\u{1F525}', '\u{2B50}', '\u{1F31F}', '\u{2728}', '\u{1F4A5}', '\u{1F389}', '\u{1F38A}', '\u{1F388}',
      '\u{1F381}', '\u{1F3C6}', '\u{1F3B5}', '\u{1F3B6}', '\u{1F3A4}', '\u{1F3B8}', '\u{1F4F7}', '\u{1F3AC}',
      '\u{1F4F1}', '\u{1F4BB}', '\u{1F4A1}', '\u{1F4B0}', '\u{1F680}', '\u{2708}\u{FE0F}', '\u{1F30E}', '\u{1F308}',
    ],
  },
  {
    name: 'Food',
    icon: '\u{1F354}',
    emojis: [
      '\u{1F34E}', '\u{1F34F}', '\u{1F350}', '\u{1F34A}', '\u{1F34B}', '\u{1F34C}', '\u{1F349}', '\u{1F347}',
      '\u{1F353}', '\u{1F352}', '\u{1F351}', '\u{1F34D}', '\u{1F965}', '\u{1F951}', '\u{1F346}', '\u{1F955}',
      '\u{1F354}', '\u{1F355}', '\u{1F32E}', '\u{1F32F}', '\u{1F37F}', '\u{1F366}', '\u{1F370}', '\u{2615}',
    ],
  },
  {
    name: 'Animals',
    icon: '\u{1F436}',
    emojis: [
      '\u{1F436}', '\u{1F431}', '\u{1F42D}', '\u{1F439}', '\u{1F430}', '\u{1F98A}', '\u{1F43B}', '\u{1F43C}',
      '\u{1F428}', '\u{1F42F}', '\u{1F981}', '\u{1F434}', '\u{1F984}', '\u{1F41D}', '\u{1F98B}', '\u{1F422}',
      '\u{1F40D}', '\u{1F419}', '\u{1F42C}', '\u{1F433}', '\u{1F988}', '\u{1F414}', '\u{1F427}', '\u{1F985}',
    ],
  },
];

// Quick reaction emojis shown in the reaction bar
export const QUICK_REACTIONS = ['\u{2764}\u{FE0F}', '\u{1F602}', '\u{1F62E}', '\u{1F622}', '\u{1F621}', '\u{1F44D}'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSelect = useCallback((emoji: string) => {
    onSelect(emoji);
  }, [onSelect]);

  return (
    <div className="absolute bottom-full left-0 mb-2 w-80 max-h-72 glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-50">
      {/* Category tabs */}
      <div className="flex border-b border-white/10 px-1 py-1 gap-0.5">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={`flex-1 py-1.5 text-center text-lg rounded-lg transition-colors ${
              i === activeCategory ? 'bg-white/15' : 'hover:bg-white/5'
            }`}
            title={cat.name}
          >
            {cat.icon}
          </button>
        ))}
        <button
          onClick={onClose}
          className="px-2 py-1.5 text-white/40 hover:text-white text-sm rounded-lg hover:bg-white/5"
          title="Close"
        >
          x
        </button>
      </div>

      {/* Emoji grid */}
      <div className="p-2 overflow-y-auto max-h-52">
        <p className="text-white/40 text-xs mb-1 px-1">{EMOJI_CATEGORIES[activeCategory].name}</p>
        <div className="grid grid-cols-8 gap-0.5">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
