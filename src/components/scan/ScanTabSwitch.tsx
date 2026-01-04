'use client';

import { CameraIcon, QrCodeIcon } from '@heroicons/react/24/outline';

interface ScanTabSwitchProps {
  showMyCode: boolean;
  onScanClick: () => void;
  onMyCodeClick: () => void;
}

export function ScanTabSwitch({ showMyCode, onScanClick, onMyCodeClick }: ScanTabSwitchProps) {
  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={onScanClick}
        className={`flex-1 py-3 rounded-xl font-medium transition ${
          !showMyCode
            ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
            : 'glass text-white/70 hover:text-white'
        }`}
      >
        <CameraIcon className="w-5 h-5 inline mr-2" />
        Scan
      </button>
      <button
        onClick={onMyCodeClick}
        className={`flex-1 py-3 rounded-xl font-medium transition ${
          showMyCode
            ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
            : 'glass text-white/70 hover:text-white'
        }`}
      >
        <QrCodeIcon className="w-5 h-5 inline mr-2" />
        My Code
      </button>
    </div>
  );
}
