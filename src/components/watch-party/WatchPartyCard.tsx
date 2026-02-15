'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  TvIcon,
  UserGroupIcon,
  LockClosedIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { WatchParty, WatchPartyStatus } from '@/types/collaboration';

const STATUS_CONFIG: Record<WatchPartyStatus, { label: string; color: string }> = {
  waiting: { label: 'Waiting', color: 'bg-yellow-500' },
  playing: { label: 'Playing', color: 'bg-green-500' },
  paused: { label: 'Paused', color: 'bg-blue-500' },
  ended: { label: 'Ended', color: 'bg-gray-500' },
};

interface WatchPartyCardProps {
  party: WatchParty;
}

export function WatchPartyCard({ party }: WatchPartyCardProps) {
  const statusConfig = STATUS_CONFIG[party.status];

  return (
    <Link
      href={`/watch-party/${party.id}`}
      className="bg-white/5 hover:bg-white/10 rounded-2xl overflow-hidden transition group"
    >
      <div className="aspect-video bg-gray-800 relative">
        {party.playlist.length > 0 && party.playlist[0].videoThumbnail ? (
          <Image src={party.playlist[0].videoThumbnail} alt={party.title + " thumbnail"} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TvIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}

        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-2 py-1 ${statusConfig.color} rounded-full text-xs font-medium`}>
            {party.status === 'playing' && <PlayIcon className="w-3 h-3" />}
            {party.status === 'paused' && <PauseIcon className="w-3 h-3" />}
            {party.status === 'waiting' && <ClockIcon className="w-3 h-3" />}
            {statusConfig.label}
          </div>
        </div>

        {party.isPrivate && (
          <div className="absolute top-3 right-3">
            <LockClosedIcon className="w-4 h-4 text-white drop-shadow" />
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/60 rounded-full text-xs">
          <UserGroupIcon className="w-3 h-3" />
          {party.participants.length}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold mb-2 group-hover:text-pink-400 transition line-clamp-1">
          {party.title}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
            {party.hostAvatar ? (
              <Image src={party.hostAvatar} alt={party.hostUsername + "'s avatar"} width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                {party.hostUsername[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium">{party.hostUsername}</div>
            <div className="text-xs text-gray-400">Host</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{party.playlist.length} videos</span>
          <span>{new Date(party.createdAt).toLocaleDateString()}</span>
        </div>

        {party.participants.length > 0 && (
          <div className="flex -space-x-2 mt-3">
            {party.participants.slice(0, 5).map((p, i) => (
              <div
                key={p.userId}
                className="w-6 h-6 rounded-full border-2 border-black bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden"
                style={{ zIndex: 5 - i }}
              >
                {p.avatar ? (
                  <Image src={p.avatar} alt={p.username + "'s avatar"} width={24} height={24} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                    {p.username[0].toUpperCase()}
                  </div>
                )}
              </div>
            ))}
            {party.participants.length > 5 && (
              <div className="w-6 h-6 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center text-[10px]">
                +{party.participants.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
