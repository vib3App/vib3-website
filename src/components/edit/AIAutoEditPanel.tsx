'use client';

export interface AISuggestion {
  id: string;
  type: string;
  label: string;
  description: string;
  value: unknown;
}

interface AIAutoEditPanelProps {
  onApplySuggestion: (type: string, value: unknown) => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  suggestions: AISuggestion[];
}

const typeIcons: Record<string, React.ReactNode> = {
  trim: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
    </svg>
  ),
  filter: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  speed: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  music: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
};

const typeColors: Record<string, string> = {
  trim: 'text-pink-400 bg-pink-500/20',
  filter: 'text-purple-400 bg-purple-500/20',
  speed: 'text-amber-400 bg-amber-500/20',
  music: 'text-teal-400 bg-teal-500/20',
};

export function AIAutoEditPanel({
  onApplySuggestion,
  isAnalyzing,
  onAnalyze,
  suggestions,
}: AIAutoEditPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">AI Auto-Edit</h3>
        {suggestions.length > 0 && (
          <span className="text-white/30 text-xs">{suggestions.length} suggestions</span>
        )}
      </div>

      {/* Analyze button */}
      {!isAnalyzing && suggestions.length === 0 && (
        <div className="text-center space-y-3 py-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <p className="text-white/50 text-sm">
            Let AI analyze your video and suggest edits
          </p>
          <button
            onClick={onAnalyze}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            Analyze Video
          </button>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="glass-card rounded-xl p-6 text-center space-y-3">
          <svg
            className="w-10 h-10 mx-auto text-purple-400 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-white text-sm font-medium">Analyzing video...</p>
          <p className="text-white/40 text-xs">
            AI is examining your footage for optimal cuts, filters, pacing, and music.
          </p>
        </div>
      )}

      {/* Suggestions list */}
      {!isAnalyzing && suggestions.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion) => {
            const colorClass = typeColors[suggestion.type] ?? 'text-white/60 bg-white/10';
            const icon = typeIcons[suggestion.type] ?? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            );

            return (
              <div
                key={suggestion.id}
                className="glass-card rounded-xl p-3 flex items-start gap-3"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                >
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{suggestion.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{suggestion.description}</p>
                </div>
                <button
                  onClick={() => onApplySuggestion(suggestion.type, suggestion.value)}
                  className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-500/30 transition flex-shrink-0"
                >
                  Apply
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Re-analyze button when suggestions exist */}
      {!isAnalyzing && suggestions.length > 0 && (
        <button
          onClick={onAnalyze}
          className="w-full px-4 py-2 glass text-white/50 rounded-xl text-sm hover:text-white hover:bg-white/10 transition"
        >
          Re-analyze Video
        </button>
      )}
    </div>
  );
}
