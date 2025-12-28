'use client';

type EditMode = 'trim' | 'filters' | 'text' | 'stickers' | 'audio';

interface EditorTabsProps {
  activeMode: EditMode;
  onModeChange: (mode: EditMode) => void;
}

const modes: { id: EditMode; label: string; icon: React.ReactNode }[] = [
  {
    id: 'trim',
    label: 'Trim',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>,
  },
  {
    id: 'filters',
    label: 'Filters',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
  },
  {
    id: 'text',
    label: 'Text',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  },
  { id: 'stickers', label: 'Stickers', icon: <span className="text-lg">😀</span> },
  {
    id: 'audio',
    label: 'Audio',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
  },
];

export function EditorTabs({ activeMode, onModeChange }: EditorTabsProps) {
  return (
    <div className="flex overflow-x-auto scrollbar-hide">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 ${
            activeMode === mode.id ? 'text-[#6366F1]' : 'text-white/50'
          }`}
        >
          {mode.icon}
          <span className="text-xs">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
