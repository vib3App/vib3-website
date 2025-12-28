'use client';

import {
  ClockIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { CollabRoomStatus } from '@/types/collaboration';

interface CollabStatusBannerProps {
  status: CollabRoomStatus;
}

const STATUS_CONFIG: Record<CollabRoomStatus, { color: string; icon: React.ComponentType<{ className?: string }>; iconColor: string; message: string }> = {
  waiting: {
    color: 'bg-yellow-500/20 border-yellow-500/50',
    icon: ClockIcon,
    iconColor: 'text-yellow-400',
    message: 'Waiting for participants to get ready',
  },
  recording: {
    color: 'bg-red-500/20 border-red-500/50',
    icon: VideoCameraIcon,
    iconColor: 'text-red-400',
    message: 'Recording in progress',
  },
  editing: {
    color: 'bg-blue-500/20 border-blue-500/50',
    icon: ArrowPathIcon,
    iconColor: 'text-blue-400',
    message: 'Editing and finalizing',
  },
  completed: {
    color: 'bg-green-500/20 border-green-500/50',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400',
    message: 'Collab completed!',
  },
  cancelled: {
    color: 'bg-gray-500/20 border-gray-500/50',
    icon: XCircleIcon,
    iconColor: 'text-gray-400',
    message: 'Collab cancelled',
  },
};

export function CollabStatusBanner({ status }: CollabStatusBannerProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.color}`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
        <span className="font-medium">{config.message}</span>
      </div>
    </div>
  );
}
