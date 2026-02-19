'use client';

import { useState, useEffect, useCallback } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';

interface SpeakerSelectorProps {
  onSelectDevice: (deviceId: string) => Promise<void>;
  getDevices: () => Promise<MediaDeviceInfo[]>;
}

export function SpeakerSelector({ onSelectDevice, getDevices }: SpeakerSelectorProps) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string>('default');
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const loadDevices = useCallback(async () => {
    const outputDevices = await getDevices();
    if (outputDevices.length === 0) {
      setIsSupported(false);
      return;
    }
    setDevices(outputDevices);
  }, [getDevices]);

  useEffect(() => {
    // Check if setSinkId is supported
    const testEl = document.createElement('audio');
    if (!('setSinkId' in testEl)) {
      setIsSupported(false);
      return;
    }
    loadDevices();

    // Listen for device changes
    const handleChange = () => loadDevices();
    navigator.mediaDevices.addEventListener('devicechange', handleChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handleChange);
  }, [loadDevices]);

  const handleSelect = async (deviceId: string) => {
    setSelectedId(deviceId);
    await onSelectDevice(deviceId);
    setIsOpen(false);
  };

  if (!isSupported || devices.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        title="Speaker Device"
      >
        <SpeakerWaveIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 z-50 w-64 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="px-3 py-2 border-b border-white/10">
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Audio Output
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {devices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => handleSelect(device.deviceId)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex items-center gap-2 ${
                    selectedId === device.deviceId
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <SpeakerWaveIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                  </span>
                  {selectedId === device.deviceId && (
                    <svg className="w-4 h-4 ml-auto text-purple-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
