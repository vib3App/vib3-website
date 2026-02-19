'use client';

interface QualitySelectorProps {
  quality: string;
  onQualityChange: (quality: string) => void;
}

const qualities = [
  { id: 'auto', label: 'Auto', desc: 'Best for your connection', icon: '🔄' },
  { id: 'max', label: 'Max (4K)', desc: 'Original quality, largest file', icon: '🎬' },
  { id: 'high', label: 'High (1080p)', desc: 'Recommended for most videos', icon: '✨' },
  { id: 'medium', label: 'Medium (720p)', desc: 'Good quality, smaller file', icon: '📱' },
  { id: 'low', label: 'Low (480p)', desc: 'Fast upload, data saver', icon: '💾' },
];

export function QualitySelector({ quality, onQualityChange }: QualitySelectorProps) {
  return (
    <div>
      <label className="block text-white font-medium mb-2">Upload Quality</label>
      <div className="space-y-2">
        {qualities.map(q => (
          <button
            key={q.id}
            onClick={() => onQualityChange(q.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
              quality === q.id
                ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 ring-1 ring-purple-500/50'
                : 'glass hover:bg-white/5'
            }`}
          >
            <span className="text-lg">{q.icon}</span>
            <div className="flex-1">
              <div className={`text-sm font-medium ${quality === q.id ? 'text-white' : 'text-white/70'}`}>
                {q.label}
              </div>
              <div className="text-xs text-white/40">{q.desc}</div>
            </div>
            {quality === q.id && (
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
