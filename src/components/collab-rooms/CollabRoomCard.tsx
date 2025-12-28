'use client';

import Link from 'next/link';
import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  VideoCameraIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { CollabRoom, CollabRoomStatus } from '@/types/collaboration';

const STATUS_CONFIG: Record<CollabRoomStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  waiting: { label: 'Waiting', color: 'bg-yellow-500', icon: ClockIcon },
  recording: { label: 'Recording', color: 'bg-red-500', icon: VideoCameraIcon },
  editing: { label: 'Editing', color: 'bg-blue-500', icon: SparklesIcon },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircleIcon },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: XCircleIcon },
};

interface CollabRoomCardProps {
  room: CollabRoom;
}

export function CollabRoomCard({ room }: CollabRoomCardProps) {
  const statusConfig = STATUS_CONFIG[room.status];
  const StatusIcon = statusConfig.icon;

  return (
    <Link
      href={`/collab/${room.id}`}
      className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${statusConfig.color} flex items-center justify-center`}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <span className="text-sm text-gray-400">{statusConfig.label}</span>
        </div>
        {room.isPrivate && <LockClosedIcon className="w-4 h-4 text-gray-400" />}
      </div>

      <h3 className="font-semibold text-lg mb-2 group-hover:text-pink-400 transition">
        {room.title}
      </h3>

      {room.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{room.description}</p>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
          {room.creatorAvatar ? (
            <img src={room.creatorAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold">
              {room.creatorUsername[0].toUpperCase()}
            </div>
          )}
        </div>
        <span className="text-sm">{room.creatorUsername}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-4 h-4" />
          {room.participants.length}/{room.maxParticipants}
        </div>
        <span>{new Date(room.createdAt).toLocaleDateString()}</span>
      </div>

      <div className="flex -space-x-2 mt-3">
        {room.participants.slice(0, 5).map((p, i) => (
          <div
            key={p.userId}
            className="w-6 h-6 rounded-full border-2 border-black bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden"
            style={{ zIndex: 5 - i }}
          >
            {p.avatar ? (
              <img src={p.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                {p.username[0].toUpperCase()}
              </div>
            )}
          </div>
        ))}
        {room.participants.length > 5 && (
          <div className="w-6 h-6 rounded-full border-2 border-black bg-gray-700 flex items-center justify-center text-[10px]">
            +{room.participants.length - 5}
          </div>
        )}
      </div>
    </Link>
  );
}
