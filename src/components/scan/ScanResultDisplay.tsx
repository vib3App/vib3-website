'use client';

import { QrCodeIcon } from '@heroicons/react/24/outline';
import type { ScanResult } from './scanUtils';

interface ScanResultDisplayProps {
  result: ScanResult;
  onScanAgain: () => void;
  onAction: () => void;
}

export function ScanResultDisplay({ result, onScanAgain, onAction }: ScanResultDisplayProps) {
  const getTitle = () => {
    switch (result.type) {
      case 'user': return 'User Found';
      case 'video': return 'Video Found';
      case 'link': return 'Link Found';
      default: return 'QR Code Scanned';
    }
  };

  const getDisplayValue = () => {
    switch (result.type) {
      case 'user': return `@${result.value}`;
      case 'video': return `Video ID: ${result.value}`;
      case 'link': return result.value;
      default: return result.rawData;
    }
  };

  const getActionLabel = () => {
    switch (result.type) {
      case 'user': return 'View Profile';
      case 'video': return 'Watch Video';
      case 'link': return 'Open Link';
      default: return 'Copy';
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-teal-400 flex items-center justify-center">
        <QrCodeIcon className="w-8 h-8 text-white" />
      </div>

      <h2 className="text-lg font-semibold text-white mb-2">{getTitle()}</h2>
      <p className="text-white/70 mb-6 break-all">{getDisplayValue()}</p>

      <div className="flex gap-3">
        <button
          onClick={onScanAgain}
          className="flex-1 py-3 glass text-white rounded-xl font-medium hover:bg-white/10 transition"
        >
          Scan Again
        </button>
        <button
          onClick={onAction}
          className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-medium hover:opacity-90 transition"
        >
          {getActionLabel()}
        </button>
      </div>
    </div>
  );
}
