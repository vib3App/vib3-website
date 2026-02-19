'use client';

interface CameraSideControlsProps {
  showFilters: boolean;
  showEffects: boolean;
  showSpeed: boolean;
  showLenses: boolean;
  showDuration: boolean;
  showEffectCategories: boolean;
  showTemplates: boolean;
  isVideoMode: boolean;
  onTogglePanel: (panel: 'filters' | 'effects' | 'speed' | 'lenses' | 'duration' | 'effectCategories' | 'templates') => void;
}

export function CameraSideControls({
  showFilters, showEffects, showSpeed, showLenses, showDuration,
  showEffectCategories, showTemplates, isVideoMode, onTogglePanel,
}: CameraSideControlsProps) {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
      <button
        onClick={() => onTogglePanel('lenses')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showLenses ? 'bg-purple-500' : 'bg-black/30'}`}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
        </svg>
        <span className="text-white text-[10px] mt-0.5">Lenses</span>
      </button>

      {/* Effect Categories (Gap 3) */}
      <button
        onClick={() => onTogglePanel('effectCategories')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showEffectCategories ? 'bg-purple-500' : 'bg-black/30'}`}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-white text-[10px] mt-0.5">FX</span>
      </button>

      <button
        onClick={() => onTogglePanel('filters')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showFilters ? 'bg-purple-500' : 'bg-black/30'}`}
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <span className="text-white text-[10px] mt-0.5">Filters</span>
      </button>

      <button
        onClick={() => onTogglePanel('effects')}
        className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showEffects ? 'bg-purple-500' : 'bg-black/30'}`}
      >
        <span className="text-lg">{'\u2728'}</span>
        <span className="text-white text-[10px] mt-0.5">Effects</span>
      </button>

      {isVideoMode && (
        <>
          <button
            onClick={() => onTogglePanel('speed')}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showSpeed ? 'bg-purple-500' : 'bg-black/30'}`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-white text-[10px] mt-0.5">Speed</span>
          </button>

          <button
            onClick={() => onTogglePanel('duration')}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showDuration ? 'bg-purple-500' : 'bg-black/30'}`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-[10px] mt-0.5">Time</span>
          </button>

          {/* Template Recording (Gap 4) */}
          <button
            onClick={() => onTogglePanel('templates')}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${showTemplates ? 'bg-purple-500' : 'bg-black/30'}`}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-white text-[10px] mt-0.5">Template</span>
          </button>
        </>
      )}
    </div>
  );
}
