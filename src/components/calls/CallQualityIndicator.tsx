'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Gap #33: Call Quality Indicator
 *
 * Uses RTCPeerConnection.getStats() to monitor:
 *  - Packets lost, jitter, round-trip time
 * Shows as green/yellow/red dot based on quality.
 * Polls every 2 seconds during an active call.
 */

type QualityLevel = 'good' | 'fair' | 'poor' | 'unknown';

interface QualityStats {
  level: QualityLevel;
  packetsLost: number;
  jitter: number;
  roundTripTime: number;
}

const POLL_INTERVAL = 2000;

function qualityFromStats(packetsLost: number, jitter: number, rtt: number): QualityLevel {
  // Poor: high packet loss or jitter or RTT
  if (packetsLost > 50 || jitter > 0.1 || rtt > 0.5) return 'poor';
  // Fair: moderate values
  if (packetsLost > 10 || jitter > 0.05 || rtt > 0.2) return 'fair';
  return 'good';
}

const QUALITY_CONFIG: Record<QualityLevel, { color: string; label: string }> = {
  good: { color: 'bg-green-500', label: 'Good' },
  fair: { color: 'bg-yellow-500', label: 'Fair' },
  poor: { color: 'bg-red-500', label: 'Poor' },
  unknown: { color: 'bg-gray-500', label: '...' },
};

interface CallQualityIndicatorProps {
  peerConnection: RTCPeerConnection | null;
  /** Show expanded stats on hover */
  showDetails?: boolean;
}

export function CallQualityIndicator({
  peerConnection,
  showDetails = false,
}: CallQualityIndicatorProps) {
  const [stats, setStats] = useState<QualityStats>({
    level: 'unknown',
    packetsLost: 0,
    jitter: 0,
    roundTripTime: 0,
  });
  const [isHovering, setIsHovering] = useState(false);
  const prevLostRef = useRef(0);

  const pollStats = useCallback(async () => {
    if (!peerConnection) return;
    try {
      const report = await peerConnection.getStats();
      let totalPacketsLost = 0;
      let jitter = 0;
      let rtt = 0;

      report.forEach((stat) => {
        if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
          totalPacketsLost = stat.packetsLost || 0;
          jitter = stat.jitter || 0;
        }
        if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
          rtt = stat.currentRoundTripTime || 0;
        }
      });

      // Calculate delta packets lost since last poll
      const deltaLost = Math.max(0, totalPacketsLost - prevLostRef.current);
      prevLostRef.current = totalPacketsLost;

      const level = qualityFromStats(deltaLost, jitter, rtt);
      setStats({ level, packetsLost: deltaLost, jitter, roundTripTime: rtt });
    } catch {
      // Stats not available
    }
  }, [peerConnection]);

  useEffect(() => {
    if (!peerConnection) return;
    const interval = setInterval(pollStats, POLL_INTERVAL);
    pollStats(); // Immediate first poll
    return () => clearInterval(interval);
  }, [peerConnection, pollStats]);

  const config = QUALITY_CONFIG[stats.level];

  return (
    <div
      className="relative flex items-center gap-1.5"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
      <span className="text-white/70 text-xs">{config.label}</span>

      {/* Expanded stats tooltip */}
      {showDetails && isHovering && stats.level !== 'unknown' && (
        <div className="absolute bottom-full mb-2 left-0 w-48 bg-black/90 backdrop-blur-xl rounded-lg border border-white/10 p-3 text-xs z-50">
          <div className="flex justify-between mb-1">
            <span className="text-white/50">Packets lost</span>
            <span className="text-white">{stats.packetsLost}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-white/50">Jitter</span>
            <span className="text-white">{(stats.jitter * 1000).toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">Round-trip</span>
            <span className="text-white">{(stats.roundTripTime * 1000).toFixed(0)}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
