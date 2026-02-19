'use client';

import type { EchoLayout } from '@/hooks/useEchoRecorder';

interface EchoLayoutSelectorProps {
  layout: EchoLayout;
  onChange: (layout: EchoLayout) => void;
}

const layouts: { id: EchoLayout; label: string; icon: React.ReactNode }[] = [
  {
    id: 'side-by-side',
    label: 'Side by Side',
    icon: (
      <div className="flex gap-0.5 w-6 h-4">
        <div className="flex-1 bg-current rounded-sm" />
        <div className="flex-1 bg-current rounded-sm opacity-50" />
      </div>
    ),
  },
  {
    id: 'top-bottom',
    label: 'Top/Bottom',
    icon: (
      <div className="flex flex-col gap-0.5 w-4 h-5">
        <div className="flex-1 bg-current rounded-sm" />
        <div className="flex-1 bg-current rounded-sm opacity-50" />
      </div>
    ),
  },
  {
    id: 'picture-in-picture',
    label: 'PiP',
    icon: (
      <div className="relative w-6 h-4">
        <div className="w-full h-full bg-current rounded-sm opacity-50" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2 bg-current rounded-sm" />
      </div>
    ),
  },
];

export function EchoLayoutSelector({ layout, onChange }: EchoLayoutSelectorProps) {
  return (
    <div className="flex gap-2">
      {layouts.map(l => (
        <button
          key={l.id}
          onClick={() => onChange(l.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
            layout === l.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/60'
          }`}
        >
          {l.icon}
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}
