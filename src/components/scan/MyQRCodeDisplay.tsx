'use client';

import { QrCodeIcon } from '@heroicons/react/24/outline';

interface MyQRCodeDisplayProps {
  username?: string;
  userId?: string;
}

export function MyQRCodeDisplay({ username, userId }: MyQRCodeDisplayProps) {
  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/profile/${username || userId}`
    : '';

  return (
    <div className="glass-card rounded-2xl p-8 text-center">
      <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-2xl p-4 flex items-center justify-center">
        <div className="text-center">
          <QrCodeIcon className="w-32 h-32 text-gray-800" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">
        @{username || 'user'}
      </h2>
      <p className="text-white/60 text-sm mb-6">
        Scan this code to follow me on VIB3
      </p>
      <p className="text-white/40 text-xs">{profileUrl}</p>
    </div>
  );
}
