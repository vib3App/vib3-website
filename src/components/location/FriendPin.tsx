'use client';

import Image from 'next/image';
import type { FriendLocation } from '@/types/location';

interface FriendPinProps {
  friend: FriendLocation;
  onClick?: () => void;
}

export function FriendPin({ friend, onClick }: FriendPinProps) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 group" title={`@${friend.username}`}>
      <div className={`w-10 h-10 rounded-full overflow-hidden border-2 ${friend.isOnline ? 'border-green-400' : 'border-white/30'} shadow-lg group-hover:scale-110 transition-transform`}>
        {friend.avatar ? (
          <Image src={friend.avatar} alt={friend.username} width={40} height={40} className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
            {friend.username[0]?.toUpperCase()}
          </div>
        )}
      </div>
      <span className="text-white text-xs font-medium drop-shadow-lg">@{friend.username}</span>
      {/* Pin point */}
      <div className="w-2 h-2 bg-white rounded-full -mt-0.5 shadow-lg" />
    </button>
  );
}
