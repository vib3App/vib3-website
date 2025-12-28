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
}

export function TextPanel({
  texts,
  showTextInput,
  newText,
  onShowTextInput,
  onNewTextChange,
  onAddText,
  onRemoveText,
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
