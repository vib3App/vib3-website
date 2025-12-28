'use client';

type FeedTab = 'forYou' | 'following';
type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational' | null;

const VIBES: { id: VibeType; label: string; emoji: string }[] = [
  { id: 'Energetic', label: 'Energetic', emoji: '⚡' },
  { id: 'Chill', label: 'Chill', emoji: '😌' },
  { id: 'Creative', label: 'Creative', emoji: '🎨' },
  { id: 'Social', label: 'Social', emoji: '👥' },
  { id: 'Romantic', label: 'Romantic', emoji: '💕' },
  { id: 'Funny', label: 'Funny', emoji: '😂' },
  { id: 'Inspirational', label: 'Inspiring', emoji: '✨' },
];

interface FeedHeaderProps {
  activeTab: FeedTab;
  selectedVibe: VibeType;
  showVibes: boolean;
  onTabChange: (tab: FeedTab) => void;
  onVibeChange: (vibe: VibeType) => void;
  onToggleVibes: () => void;
}

export function FeedHeader({
  activeTab,
  selectedVibe,
  showVibes,
  onTabChange,
  onVibeChange,
  onToggleVibes,
}: FeedHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:left-64 bg-gradient-to-b from-black/50 to-transparent">
      <div className="flex items-center justify-center gap-6 pt-4 pb-2">
        <button
          onClick={() => { onTabChange('following'); onVibeChange(null); }}
          className={`text-lg font-semibold transition-colors ${activeTab === 'following' && !selectedVibe ? 'text-white' : 'text-white/50'}`}
        >
          Following
        </button>
        <div className="w-0.5 h-4 bg-white/30" />
        <button
          onClick={() => { onTabChange('forYou'); onVibeChange(null); }}
          className={`text-lg font-semibold transition-colors ${activeTab === 'forYou' && !selectedVibe ? 'text-white' : 'text-white/50'}`}
        >
          For You
        </button>
        <div className="w-0.5 h-4 bg-white/30" />
        <button
          onClick={onToggleVibes}
          className={`text-lg font-semibold transition-colors flex items-center gap-1 ${selectedVibe ? 'text-white' : 'text-white/50'}`}
        >
          {selectedVibe ? VIBES.find(v => v.id === selectedVibe)?.emoji : '✨'} Vibes
          <svg className={`w-4 h-4 transition-transform ${showVibes ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showVibes && (
        <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => { onVibeChange(null); onToggleVibes(); }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !selectedVibe ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All
          </button>
          {VIBES.map(vibe => (
            <button
              key={vibe.id}
              onClick={() => { onVibeChange(vibe.id); onToggleVibes(); }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                selectedVibe === vibe.id ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {vibe.emoji} {vibe.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

export type { FeedTab, VibeType };
export { VIBES };
