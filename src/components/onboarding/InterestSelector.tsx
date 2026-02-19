'use client';

interface InterestSelectorProps {
  selected: string[];
  onToggle: (interest: string) => void;
}

const interests = [
  { id: 'dance', label: 'Dance', emoji: '\u{1F483}' },
  { id: 'comedy', label: 'Comedy', emoji: '\u{1F602}' },
  { id: 'music', label: 'Music', emoji: '\u{1F3B5}' },
  { id: 'food', label: 'Food', emoji: '\u{1F355}' },
  { id: 'fitness', label: 'Fitness', emoji: '\u{1F4AA}' },
  { id: 'fashion', label: 'Fashion', emoji: '\u{1F457}' },
  { id: 'travel', label: 'Travel', emoji: '\u{2708}\u{FE0F}' },
  { id: 'gaming', label: 'Gaming', emoji: '\u{1F3AE}' },
  { id: 'art', label: 'Art', emoji: '\u{1F3A8}' },
  { id: 'tech', label: 'Tech', emoji: '\u{1F4BB}' },
  { id: 'pets', label: 'Pets', emoji: '\u{1F415}' },
  { id: 'sports', label: 'Sports', emoji: '\u{26BD}' },
  { id: 'beauty', label: 'Beauty', emoji: '\u{1F484}' },
  { id: 'diy', label: 'DIY', emoji: '\u{1F528}' },
  { id: 'education', label: 'Education', emoji: '\u{1F4DA}' },
  { id: 'nature', label: 'Nature', emoji: '\u{1F33F}' },
];

export function InterestSelector({ selected, onToggle }: InterestSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {interests.map(interest => {
        const isSelected = selected.includes(interest.id);
        return (
          <button
            key={interest.id}
            onClick={() => onToggle(interest.id)}
            className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 ring-2 ring-purple-500 text-white'
                : 'glass text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-2xl">{interest.emoji}</span>
            <span className="font-medium text-sm">{interest.label}</span>
          </button>
        );
      })}
    </div>
  );
}
