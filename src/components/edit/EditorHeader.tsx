'use client';

interface EditorHeaderProps {
  onCancel: () => void;
  onDone: () => void;
  isProcessing?: boolean;
}

export function EditorHeader({ onCancel, onDone, isProcessing }: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 aurora-bg">
      <button
        onClick={onCancel}
        className="text-white/50 hover:text-white disabled:opacity-30"
        disabled={isProcessing}
      >
        Cancel
      </button>
      <h1 className="text-white font-medium">Edit</h1>
      <button
        onClick={onDone}
        className="text-purple-400 font-medium disabled:opacity-30 flex items-center gap-2"
        disabled={isProcessing}
      >
        {isProcessing && (
          <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
        )}
        {isProcessing ? 'Processing...' : 'Done'}
      </button>
    </header>
  );
}
