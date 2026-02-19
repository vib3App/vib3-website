'use client';

interface ChampionBadgeProps {
  gauntletName: string;
  dateWon: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ChampionBadge({ gauntletName, dateWon, size = 'md', className = '' }: ChampionBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const formattedDate = new Date(dateWon).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className={`relative group cursor-default ${className}`} title={`${gauntletName} Champion - ${formattedDate}`}>
      {/* Badge */}
      <div className={`${sizeClasses[size]} relative`}>
        {/* Gold glow */}
        <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-md group-hover:blur-lg transition" />

        {/* Badge body */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg shadow-yellow-500/30 border-2 border-yellow-300/50">
          {/* Crown icon */}
          <svg
            className={`${iconSizes[size]} text-white drop-shadow-sm`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
            <path d="M5 19a1 1 0 011-1h12a1 1 0 010 2H6a1 1 0 01-1-1z" />
          </svg>
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-black/90 backdrop-blur-lg rounded-lg px-3 py-2 text-center whitespace-nowrap shadow-xl border border-yellow-500/20">
          <p className={`text-yellow-400 font-bold ${textSizes[size]} uppercase tracking-wider`}>
            Champion
          </p>
          <p className="text-white text-xs font-medium mt-0.5">
            {gauntletName}
          </p>
          <p className="text-white/40 text-[10px] mt-0.5">
            {formattedDate}
          </p>
        </div>
        {/* Arrow */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-r border-b border-yellow-500/20" />
      </div>
    </div>
  );
}

/** List of champion badges for a profile */
interface ChampionBadgeListProps {
  badges: Array<{ gauntletId: string; gauntletName: string; dateWon: string }>;
  maxDisplay?: number;
}

export function ChampionBadgeList({ badges, maxDisplay = 5 }: ChampionBadgeListProps) {
  if (!badges || badges.length === 0) return null;

  const displayed = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1.5">
      {displayed.map((b) => (
        <ChampionBadge
          key={b.gauntletId}
          gauntletName={b.gauntletName}
          dateWon={b.dateWon}
          size="sm"
        />
      ))}
      {remaining > 0 && (
        <span className="text-yellow-400/60 text-xs font-medium">
          +{remaining}
        </span>
      )}
    </div>
  );
}
