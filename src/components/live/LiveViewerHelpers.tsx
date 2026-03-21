'use client';

import { useState } from 'react';
import {
  SignalIcon,
  UserGroupIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  GiftIcon,
} from '@heroicons/react/24/solid';
import { useAgoraContext } from './AgoraProvider';

export function ViewerCount() {
  const { remoteUsers } = useAgoraContext();

  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
      <UserGroupIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-medium">{remoteUsers.length}</span>
    </div>
  );
}

export function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded-full">
      <SignalIcon className="w-4 h-4 text-white" />
      <span className="text-white text-sm font-bold">LIVE</span>
    </div>
  );
}

export function HostVideo() {
  const { remoteUsers, hostVideoRef } = useAgoraContext();

  if (remoteUsers.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
        <div className="text-center text-white/70">
          <SignalIcon className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Waiting for host...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black">
      <div ref={hostVideoRef} className="w-full h-full" />
    </div>
  );
}

interface ViewerActionsProps {
  onLike: () => void;
  onOpenChat: () => void;
  onOpenGifts: () => void;
}

export function ViewerActions({ onLike, onOpenChat, onOpenGifts }: ViewerActionsProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      onLike();
    }
  };

  return (
    <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4">
      <button
        onClick={handleLike}
        className={`p-3 rounded-full transition ${
          liked ? 'bg-pink-500 scale-110' : 'bg-white/20 hover:bg-white/30'
        }`}
      >
        <HeartIcon className={`w-7 h-7 ${liked ? 'text-white' : 'text-white'}`} />
      </button>

      <button
        onClick={onOpenChat}
        className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition"
      >
        <ChatBubbleLeftIcon className="w-7 h-7 text-white" />
      </button>

      <button
        onClick={onOpenGifts}
        className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 transition"
      >
        <GiftIcon className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
