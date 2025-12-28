'use client';

import { useState, useEffect } from 'react';

interface EnergyMeterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnergyMeter({ isOpen, onClose }: EnergyMeterProps) {
  const [energyScore, setEnergyScore] = useState(8.8);
  const [liveUsers, setLiveUsers] = useState(1153);
  const [vibeScore, setVibeScore] = useState(9.3);
  const [rotation, setRotation] = useState(0);

  // Animate the meter
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setEnergyScore((prev) => Math.min(10, Math.max(0, prev + (Math.random() - 0.5) * 0.2)));
      setLiveUsers((prev) => Math.max(0, prev + Math.floor((Math.random() - 0.5) * 20)));
      setVibeScore((prev) => Math.min(10, Math.max(0, prev + (Math.random() - 0.5) * 0.1)));
      setRotation((prev) => prev + 1);
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const getEnergyColor = (score: number) => {
    if (score >= 8) return '#00ff88';
    if (score >= 6) return '#ffdd00';
    if (score >= 4) return '#ff8800';
    return '#ff4444';
  };

  const energyColor = getEnergyColor(energyScore);
  const needleRotation = (energyScore / 10) * 180 - 90; // -90 to 90 degrees

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn" />

      {/* Modal */}
      <div
        className="relative bg-neutral-900 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Energy Meter
        </h2>
        <p className="text-white/50 text-center mb-8">
          Real-time platform engagement energy
        </p>

        {/* Meter visualization */}
        <div className="relative w-64 h-32 mx-auto mb-8">
          {/* Meter background arc */}
          <svg className="w-full h-full" viewBox="0 0 200 100">
            <defs>
              <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff4444" />
                <stop offset="33%" stopColor="#ff8800" />
                <stop offset="66%" stopColor="#ffdd00" />
                <stop offset="100%" stopColor="#00ff88" />
              </linearGradient>
            </defs>
            {/* Background arc */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="#333"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Colored arc */}
            <path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke="url(#meterGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(energyScore / 10) * 251} 251`}
            />
            {/* Needle */}
            <g transform={`rotate(${needleRotation}, 100, 90)`}>
              <line
                x1="100"
                y1="90"
                x2="100"
                y2="25"
                stroke={energyColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="90" r="8" fill={energyColor} />
            </g>
            {/* Tick marks */}
            {[0, 2.5, 5, 7.5, 10].map((tick, i) => {
              const angle = ((tick / 10) * 180 - 90) * (Math.PI / 180);
              const x1 = 100 + 65 * Math.cos(angle);
              const y1 = 90 + 65 * Math.sin(angle);
              const x2 = 100 + 75 * Math.cos(angle);
              const y2 = 90 + 75 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#666"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Center score */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <div className="text-4xl font-bold" style={{ color: energyColor }}>
              {energyScore.toFixed(1)}
            </div>
            <div className="text-white/50 text-sm">Energy Score</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
                style={{ animationDuration: '1s' }}
              />
              <span className="text-2xl font-bold text-white">{liveUsers.toLocaleString()}</span>
            </div>
            <p className="text-white/50 text-sm">Live Users</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{vibeScore.toFixed(1)}</div>
            <p className="text-white/50 text-sm">Vibe Score</p>
          </div>
        </div>

        {/* Spinning energy ring */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full border-4 border-transparent"
            style={{
              borderTopColor: energyColor,
              borderRightColor: energyColor,
              transform: `rotate(${rotation}deg)`,
              boxShadow: `0 0 20px ${energyColor}40`,
            }}
          />
        </div>

        {/* Energy breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70">Content Creation</span>
            <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(energyScore / 10) * 100}%` }}
              />
            </div>
            <span className="text-white/50 text-sm">High</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Engagement</span>
            <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${(vibeScore / 10) * 100}%` }}
              />
            </div>
            <span className="text-white/50 text-sm">Very High</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70">Community</span>
            <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-300"
                style={{ width: '78%' }}
              />
            </div>
            <span className="text-white/50 text-sm">Active</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
