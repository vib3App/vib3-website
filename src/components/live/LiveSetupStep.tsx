'use client';

import { VideoCameraIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { StreamMode } from '@/hooks/useLiveSetup';

interface LiveSetupStepProps {
  streamMode: StreamMode;
  onStreamModeChange: (mode: StreamMode) => void;
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMic: string;
  onCameraChange: (id: string) => void;
  onMicChange: (id: string) => void;
  onStartPreview: () => void;
}

export function LiveSetupStep({
  streamMode, onStreamModeChange, cameras, mics,
  selectedCamera, selectedMic, onCameraChange, onMicChange, onStartPreview,
}: LiveSetupStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Stream Source</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { mode: 'camera' as StreamMode, icon: VideoCameraIcon, label: 'Camera', desc: 'Stream from webcam' },
            { mode: 'screen' as StreamMode, icon: SparklesIcon, label: 'Screen', desc: 'Share your screen' },
            { mode: 'both' as StreamMode, icon: UserGroupIcon, label: 'Both', desc: 'Screen + camera overlay' },
          ].map(({ mode, icon: Icon, label, desc }) => (
            <button
              key={mode}
              onClick={() => onStreamModeChange(mode)}
              className={`p-4 rounded-xl border-2 transition ${
                streamMode === mode ? 'border-pink-500 bg-pink-500/10' : 'border-white/20 hover:border-white/40'
              }`}
            >
              <Icon className="w-8 h-8 mx-auto mb-2" />
              <div className="font-medium">{label}</div>
              <div className="text-xs text-gray-400 mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </section>

      {streamMode !== 'screen' && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Devices</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Camera</label>
              <select
                value={selectedCamera}
                onChange={(e) => onCameraChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
              >
                <option value="">Default Camera</option>
                {cameras.map((cam, i) => (
                  <option key={cam.deviceId} value={cam.deviceId}>
                    {cam.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Microphone</label>
              <select
                value={selectedMic}
                onChange={(e) => onMicChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
              >
                <option value="">Default Microphone</option>
                {mics.map((mic, i) => (
                  <option key={mic.deviceId} value={mic.deviceId}>
                    {mic.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      <button
        onClick={onStartPreview}
        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl font-semibold text-lg hover:opacity-90 transition"
      >
        Start Preview
      </button>
    </div>
  );
}
