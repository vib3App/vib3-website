'use client';

interface EditorHeaderProps {
  onCancel: () => void;
  onDone: () => void;
}

export function EditorHeader({ onCancel, onDone }: EditorHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 h-14 aurora-bg">
      <button onClick={onCancel} className="text-white/50 hover:text-white">Cancel</button>
      <h1 className="text-white font-medium">Edit</h1>
      <button onClick={onDone} className="text-purple-400 font-medium">Done</button>
    </header>
  );
}
