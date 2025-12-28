'use client';

type FeedTab = 'forYou' | 'following';
type VibeType = 'Energetic' | 'Chill' | 'Creative' | 'Social' | 'Romantic' | 'Funny' | 'Inspirational' | null;

const VIBES: { id: VibeType; label: string; emoji: string; color: string }[] = [
  { id: 'Energetic', label: 'Energetic', emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
  { id: 'Chill', label: 'Chill', emoji: '😌', color: 'from-blue-400 to-cyan-500' },
  { id: 'Creative', label: 'Creative', emoji: '🎨', color: 'from-purple-500 to-pink-500' },
  { id: 'Social', label: 'Social', emoji: '👥', color: 'from-green-400 to-teal-500' },
  { id: 'Romantic', label: 'Romantic', emoji: '💕', color: 'from-pink-400 to-rose-500' },
  { id: 'Funny', label: 'Funny', emoji: '😂', color: 'from-amber-400 to-yellow-500' },
  { id: 'Inspirational', label: 'Inspiring', emoji: '✨', color: 'from-violet-400 to-purple-500' },
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
  const selectedVibeData = VIBES.find(v => v.id === selectedVibe);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 md:left-64">
      {/* Liquid Glass Header Bar */}
      <div className="glass-heavy mx-4 mt-3 rounded-2xl px-2 py-1">
        <div className="flex items-center justify-center gap-2">
          {/* Following Tab */}
          <button
            onClick={() => { onTabChange('following'); onVibeChange(null); }}
            className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'following' && !selectedVibe
                ? 'text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {activeTab === 'following' && !selectedVibe && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-teal-500/30 rounded-xl blur-sm" />
            )}
            <span className="relative">Following</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {/* For You Tab */}
          <button
            onClick={() => { onTabChange('forYou'); onVibeChange(null); }}
            className={`relative px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'forYou' && !selectedVibe
                ? 'text-white'
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {activeTab === 'forYou' && !selectedVibe && (
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/30 to-purple-500/30 rounded-xl blur-sm" />
            )}
            <span className="relative">For You</span>
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          {/* Vibes Toggle */}
          <button
            onClick={onToggleVibes}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
              selectedVibe ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {selectedVibe && (
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedVibeData?.color} opacity-30 rounded-xl blur-sm`} />
            )}
            <span className="relative flex items-center gap-1.5">
              <span className="text-lg">{selectedVibe ? selectedVibeData?.emoji : '✨'}</span>
              Vibes
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showVibes ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      {/* Vibes Dropdown - Liquid Glass Pills */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${showVibes ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {/* All Button */}
          <button
            onClick={() => { onVibeChange(null); onToggleVibes(); }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border backdrop-blur-xl ${
              !selectedVibe
                ? 'bg-white/20 border-white/30 text-white shadow-lg shadow-white/10'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            All Vibes
          </button>

          {/* Vibe Pills */}
          {VIBES.map((vibe, i) => (
            <button
              key={vibe.id}
              onClick={() => { onVibeChange(vibe.id); onToggleVibes(); }}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 border backdrop-blur-xl ${
                selectedVibe === vibe.id
                  ? `bg-gradient-to-r ${vibe.color} border-white/30 text-white shadow-lg`
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
              style={{
                animationDelay: `${i * 50}ms`,
                animation: showVibes ? 'slide-up-scale 0.3s ease-out forwards' : 'none'
              }}
            >
              <span className="text-base">{vibe.emoji}</span>
              {vibe.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export type { FeedTab, VibeType };
export { VIBES };
