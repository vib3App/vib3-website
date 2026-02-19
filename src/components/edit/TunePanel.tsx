'use client';

import type { TuneSettings } from '@/services/videoProcessor';

interface TunePanelProps {
  tune: TuneSettings;
  onTuneChange: (tune: TuneSettings) => void;
}

interface TuneSlider {
  key: keyof TuneSettings;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultVal: number;
  format: (v: number) => string;
}

const sliders: TuneSlider[] = [
  {
    key: 'brightness',
    label: 'Brightness',
    min: -1,
    max: 1,
    step: 0.05,
    defaultVal: 0,
    format: (v) => `${v >= 0 ? '+' : ''}${Math.round(v * 100)}%`,
  },
  {
    key: 'contrast',
    label: 'Contrast',
    min: 0.5,
    max: 2,
    step: 0.05,
    defaultVal: 1,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: 'saturation',
    label: 'Saturation',
    min: 0,
    max: 3,
    step: 0.05,
    defaultVal: 1,
    format: (v) => `${Math.round(v * 100)}%`,
  },
  {
    key: 'exposure',
    label: 'Exposure',
    min: -1,
    max: 1,
    step: 0.05,
    defaultVal: 0,
    format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} EV`,
  },
];

export function TunePanel({ tune, onTuneChange }: TunePanelProps) {
  const handleSliderChange = (key: keyof TuneSettings, value: number) => {
    onTuneChange({ ...tune, [key]: value });
  };

  const handleReset = () => {
    onTuneChange({ brightness: 0, contrast: 1, saturation: 1, exposure: 0 });
  };

  const isDefault =
    tune.brightness === 0 &&
    tune.contrast === 1 &&
    tune.saturation === 1 &&
    tune.exposure === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">Tune</h3>
        {!isDefault && (
          <button
            onClick={handleReset}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Reset All
          </button>
        )}
      </div>

      {sliders.map((s) => (
        <div key={s.key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/60 text-sm">{s.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-xs">
                {s.format(tune[s.key])}
              </span>
              {tune[s.key] !== s.defaultVal && (
                <button
                  onClick={() => handleSliderChange(s.key, s.defaultVal)}
                  className="text-white/30 hover:text-white text-xs"
                  title={`Reset ${s.label}`}
                >
                  x
                </button>
              )}
            </div>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={tune[s.key]}
            onChange={(e) =>
              handleSliderChange(s.key, parseFloat(e.target.value))
            }
            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      ))}

      <p className="text-white/30 text-xs">
        Adjustments preview via CSS and are baked into the export via FFmpeg
        eq filter.
      </p>
    </div>
  );
}
