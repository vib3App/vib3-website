'use client';

import type { TextOverlay } from '@/hooks/useVideoEditor';

interface TextPanelProps {
  texts: TextOverlay[];
  showTextInput: boolean;
  newText: string;
  onShowTextInput: (show: boolean) => void;
  onNewTextChange: (text: string) => void;
  onAddText: () => void;
  onRemoveText: (id: string) => void;
  textStyle: string;
  onTextStyleChange: (style: string) => void;
}

const TEXT_STYLES = [
  { id: 'shadow', label: 'Shadow' },
  { id: 'background', label: 'Background' },
  { id: 'outline', label: 'Outline' },
  { id: 'none', label: 'Plain' },
];

export function TextPanel({
  texts,
  showTextInput,
  newText,
  onShowTextInput,
  onNewTextChange,
  onAddText,
  onRemoveText,
  textStyle,
  onTextStyleChange,
}: TextPanelProps) {
  return (
    <div className="space-y-4">
      {showTextInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => onNewTextChange(e.target.value)}
            placeholder="Enter text..."
            className="flex-1 aurora-bg text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30"
            autoFocus
          />
          <button onClick={onAddText} className="px-4 py-3 bg-purple-500 text-white rounded-xl">Add</button>
        </div>
      ) : (
        <button
          onClick={() => onShowTextInput(true)}
          className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40"
        >
          + Add Text
        </button>
      )}

      {/* Text style (applies to all text overlays) */}
      <div>
        <p className="text-white/50 text-sm mb-2">Style</p>
        <div className="flex gap-2">
          {TEXT_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onTextStyleChange(s.id)}
              className={`flex-1 py-1.5 text-sm rounded-lg transition ${
                textStyle === s.id ? 'bg-purple-500 text-white' : 'glass text-white/50 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {texts.length > 0 && (
        <div className="space-y-2">
          {texts.map((text) => (
            <div key={text.id} className="flex items-center justify-between p-3 aurora-bg rounded-lg">
              <span className="text-white">{text.text}</span>
              <button onClick={() => onRemoveText(text.id)} className="text-white/30 hover:text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
