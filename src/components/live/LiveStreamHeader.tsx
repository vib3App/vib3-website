'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon, SignalIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import type { LiveStream } from '@/types';

interface LiveStreamHeaderProps {
  stream: LiveStream;
  viewerCount: number;
}

export function LiveStreamHeader({ stream, viewerCount }: LiveStreamHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/live" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
              {stream.hostAvatar ? (
                <Image src={stream.hostAvatar} alt={stream.hostUsername + "'s avatar"} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                  {stream.hostUsername[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium">{stream.hostUsername}</div>
              <div className="text-xs text-gray-400">{stream.title}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full text-sm">
            <SignalIcon className="w-4 h-4" />
            LIVE
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm">
            <UserGroupIcon className="w-4 h-4" />
            {viewerCount.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
