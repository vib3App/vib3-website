'use client';

interface CameraSideControlsProps {
  showFilters: boolean;
  showEffects: boolean;
  showSpeed: boolean;
  onTogglePanel: (panel: 'filters' | 'effects' | 'speed') => void;
}

export function CameraSideControls({ showFilters, showEffects, showSpeed, onTogglePanel }: CameraSideControlsProps) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
      <button
        onClick={() => onTogglePanel('filters')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showFilters ? 'bg-[#6366F1]' : 'bg-black/30'}`}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="text-white text-[10px] mt-0.5">Filters</span>
      </button>

      <button
        onClick={() => onTogglePanel('effects')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showEffects ? 'bg-[#6366F1]' : 'bg-black/30'}`}
      >
        <span className="text-lg">✨</span>
        <span className="text-white text-[10px] mt-0.5">Effects</span>
      </button>

      <button
        onClick={() => onTogglePanel('speed')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showSpeed ? 'bg-[#6366F1]' : 'bg-black/30'}`}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-white text-[10px] mt-0.5">Speed</span>
      </button>
    </div>
  );
}
