'use client';

interface TemplatePanelProps {
  selectedTemplate: string | null;
  onSelect: (templateId: string | null) => void;
}

const templates = [
  { id: 'vlog', name: 'Vlog Intro', description: 'Animated title + subscribe', thumbnail: 'from-purple-500 to-pink-500' },
  { id: 'recipe', name: 'Recipe Card', description: 'Ingredients + steps overlay', thumbnail: 'from-orange-500 to-yellow-500' },
  { id: 'travel', name: 'Travel Montage', description: 'Location stamps + map', thumbnail: 'from-blue-500 to-cyan-500' },
  { id: 'product', name: 'Product Review', description: 'Rating + pros/cons', thumbnail: 'from-green-500 to-emerald-500' },
  { id: 'tutorial', name: 'Tutorial', description: 'Step numbers + highlights', thumbnail: 'from-indigo-500 to-purple-500' },
  { id: 'fitness', name: 'Workout', description: 'Timer + rep counter', thumbnail: 'from-red-500 to-orange-500' },
  { id: 'music', name: 'Music Video', description: 'Lyrics + visualizer', thumbnail: 'from-pink-500 to-purple-500' },
  { id: 'story', name: 'Story Time', description: 'Text animation + captions', thumbnail: 'from-teal-500 to-blue-500' },
];

export function TemplatePanel({ selectedTemplate, onSelect }: TemplatePanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Templates</h3>
        {selectedTemplate && (
          <button onClick={() => onSelect(null)} className="text-xs text-purple-400 hover:text-purple-300">
            Clear
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`text-left rounded-xl overflow-hidden transition-all ${
              selectedTemplate === t.id ? 'ring-2 ring-purple-500' : 'hover:ring-1 hover:ring-white/20'
            }`}
          >
            <div className={`h-20 bg-gradient-to-br ${t.thumbnail} flex items-end p-3`}>
              <span className="text-white text-sm font-semibold drop-shadow">{t.name}</span>
            </div>
            <div className="p-2 bg-white/5">
              <p className="text-white/40 text-xs">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
