'use client';

import type { LocationSettings } from '@/types/location';

interface MapSettingsPanelProps {
  settings: LocationSettings;
  onUpdateSettings: (update: Partial<LocationSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MARKER_STYLES: Array<{ id: LocationSettings['markerStyle']; label: string; desc: string }> = [
  { id: 'default', label: 'Default', desc: 'Avatar with name tag' },
  { id: 'minimal', label: 'Minimal', desc: 'Small dot only' },
  { id: 'avatar', label: 'Avatar', desc: 'Large avatar pin' },
  { id: 'bubble', label: 'Bubble', desc: 'Name bubble with avatar' },
];

const MARKER_SIZES: Array<{ id: NonNullable<LocationSettings['markerSize']>; label: string }> = [
  { id: 'small', label: 'Small' },
  { id: 'medium', label: 'Medium' },
  { id: 'large', label: 'Large' },
];

const MAP_STYLES: Array<{ id: NonNullable<LocationSettings['mapStyle']>; label: string; color: string }> = [
  { id: 'dark', label: 'Dark', color: '#1a1a2e' },
  { id: 'satellite', label: 'Satellite', color: '#2d4a3e' },
  { id: 'terrain', label: 'Terrain', color: '#3a3a2e' },
  { id: 'light', label: 'Light', color: '#e8e8e8' },
];

export function MapSettingsPanel({ settings, onUpdateSettings, isOpen, onClose }: MapSettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-heavy rounded-2xl border border-white/10 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 glass-heavy">
            <h2 className="text-white font-bold text-lg">Map Settings</h2>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Marker Style */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-3">Marker Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {MARKER_STYLES.map(ms => (
                  <button
                    key={ms.id}
                    onClick={() => onUpdateSettings({ markerStyle: ms.id })}
                    className={`p-3 rounded-xl border transition text-left ${
                      (settings.markerStyle || 'default') === ms.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <p className="text-white text-sm font-medium">{ms.label}</p>
                    <p className="text-white/30 text-xs">{ms.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Marker Size */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-3">Marker Size</h3>
              <div className="flex gap-2">
                {MARKER_SIZES.map(ms => (
                  <button
                    key={ms.id}
                    onClick={() => onUpdateSettings({ markerSize: ms.id })}
                    className={`flex-1 py-2 rounded-lg text-sm transition ${
                      (settings.markerSize || 'medium') === ms.id
                        ? 'bg-purple-500 text-white'
                        : 'glass text-white/50 hover:text-white'
                    }`}
                  >
                    {ms.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Style */}
            <div>
              <h3 className="text-white/60 text-sm font-medium mb-3">Map Style</h3>
              <div className="flex gap-2">
                {MAP_STYLES.map(ms => (
                  <button
                    key={ms.id}
                    onClick={() => onUpdateSettings({ mapStyle: ms.id })}
                    className={`flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg transition ${
                      (settings.mapStyle || 'dark') === ms.id
                        ? 'ring-2 ring-purple-500'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg border border-white/10" style={{ backgroundColor: ms.color }} />
                    <span className="text-white/60 text-[10px]">{ms.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <h3 className="text-white/60 text-sm font-medium">Overlays</h3>
              <SettingToggle
                label="Show Activity on Markers"
                description="Display activity icons on friend pins"
                enabled={settings.showActivityOnMarker !== false}
                onToggle={() => onUpdateSettings({ showActivityOnMarker: !(settings.showActivityOnMarker !== false) })}
              />
              <SettingToggle
                label="Activity Heatmap"
                description="Show heatmap overlay on map"
                enabled={settings.showHeatmap === true}
                onToggle={() => onUpdateSettings({ showHeatmap: !settings.showHeatmap })}
              />
              <SettingToggle
                label="Points of Interest"
                description="Show nearby places on map"
                enabled={settings.showPOIs === true}
                onToggle={() => onUpdateSettings({ showPOIs: !settings.showPOIs })}
              />
              <SettingToggle
                label="Nearby Events"
                description="Show Ticketmaster events on map"
                enabled={settings.showEvents === true}
                onToggle={() => onUpdateSettings({ showEvents: !settings.showEvents })}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingToggle({ label, description, enabled, onToggle }: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition">
      <div className="text-left">
        <p className="text-white text-sm">{label}</p>
        <p className="text-white/30 text-xs">{description}</p>
      </div>
      <div className={`w-10 h-6 rounded-full transition-colors relative ${enabled ? 'bg-purple-500' : 'bg-white/10'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'left-5' : 'left-1'}`} />
      </div>
    </button>
  );
}
