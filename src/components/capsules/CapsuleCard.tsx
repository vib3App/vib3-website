'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  LockClosedIcon,
  BellIcon,
  BellSlashIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { formatTimeUntil } from '@/hooks/useCapsules';
import { formatCount } from '@/utils/format';
import type { TimeCapsule, CapsuleStatus } from '@/types/capsule';

const STATUS_CONFIG: Record<CapsuleStatus, { label: string; color: string; bgColor: string }> = {
  sealed: { label: 'Sealed', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  unlocking: { label: 'Unlocking...', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  unlocked: { label: 'Unlocked', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  expired: { label: 'Expired', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
};

interface CapsuleCardProps {
  capsule: TimeCapsule;
  isOwner: boolean;
  isSubscribed: boolean;
  onSubscribe: (id: string) => void;
}

export function CapsuleCard({ capsule, isOwner, isSubscribed, onSubscribe }: CapsuleCardProps) {
  const statusConfig = STATUS_CONFIG[capsule.status];

  return (
    <div className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition group relative">
      {/* Cover Image */}
      <div className="aspect-video bg-gray-800 relative overflow-hidden">
        {capsule.status === 'unlocked' && capsule.thumbnailUrl ? (
          <Image
            src={capsule.thumbnailUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : capsule.coverImageUrl ? (
          <Image
            src={capsule.coverImageUrl}
            alt=""
            fill
            className="object-cover blur-sm opacity-50"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
            <LockClosedIcon className="w-16 h-16 text-purple-400 opacity-50" />
          </div>
        )}

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 ${statusConfig.bgColor} rounded-full`}>
          <span className={`text-xs font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        {/* Lock Icon for sealed capsules */}
        {capsule.status !== 'unlocked' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
              <LockClosedIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        )}

        {/* Countdown */}
        {capsule.status === 'sealed' && (
          <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-black/70 rounded-lg flex items-center justify-between">
            <span className="text-xs text-gray-400">Unlocks in</span>
            <span className="font-mono font-bold text-purple-400">
              {formatTimeUntil(capsule.unlockAt)}
            </span>
          </div>
        )}

        {/* Subscribe Button */}
        {capsule.status === 'sealed' && !isOwner && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onSubscribe(capsule.id);
            }}
            className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
            title={isSubscribed ? 'Unsubscribe' : 'Notify me'}
          >
            {isSubscribed ? (
              <BellIcon className="w-5 h-5 text-purple-400" />
            ) : (
              <BellSlashIcon className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-1 group-hover:text-purple-400 transition">
          {capsule.title}
        </h3>

        {capsule.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {capsule.description}
          </p>
        )}

        {/* Creator */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
            {capsule.creatorAvatar ? (
              <Image src={capsule.creatorAvatar} alt="" width={32} height={32} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                {capsule.creatorUsername[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-sm">{capsule.creatorUsername}</span>
        </div>

        {/* Stats (for unlocked) */}
        {capsule.status === 'unlocked' && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              {formatCount(capsule.viewCount)}
            </div>
            <div className="flex items-center gap-1">
              <HeartIcon className="w-4 h-4" />
              {formatCount(capsule.likeCount)}
            </div>
          </div>
        )}

        {/* Unlock date */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <CalendarIcon className="w-4 h-4" />
          {capsule.status === 'unlocked'
            ? `Unlocked ${new Date(capsule.unlockedAt!).toLocaleDateString()}`
            : `Unlocks ${new Date(capsule.unlockAt).toLocaleDateString()}`
          }
        </div>

        {/* Recipients (for private capsules) */}
        {capsule.isPrivate && capsule.recipientUsernames && capsule.recipientUsernames.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            For: {capsule.recipientUsernames.join(', ')}
          </div>
        )}
      </div>

      {/* Link overlay for unlocked capsules */}
      {capsule.status === 'unlocked' && (
        <Link href={`/capsule/${capsule.id}`} className="absolute inset-0" />
      )}
    </div>
  );
}
