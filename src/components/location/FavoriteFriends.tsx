'use client';

import Image from 'next/image';
import type { FriendLocation } from '@/types/location';
import { formatDistance, calculateDistanceMeters } from '@/utils/distance';

interface FavoriteFriendsProps {
  friends: FriendLocation[];
  myLocation: { lat: number; lng: number } | null;
  onToggleFavorite: (userId: string) => void;
  onSelectFriend: (friend: { userId: string; username: string }) => void;
}

export function FavoriteFriends({ friends, myLocation, onToggleFavorite, onSelectFriend }: FavoriteFriendsProps) {
  const favorites = friends.filter(f => f.isFavorite);

  if (favorites.length === 0) {
    return (
      <div className="mb-4">
        <h3 className="text-white/50 text-sm font-medium mb-2">Favorites</h3>
        <p className="text-white/20 text-xs text-center py-2">
          Star friends to pin them here
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h3 className="text-white/50 text-sm font-medium mb-2">
        Favorites ({favorites.length})
      </h3>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {favorites.map(friend => {
          const dist = myLocation
            ? calculateDistanceMeters(myLocation.lat, myLocation.lng, friend.latitude, friend.longitude)
            : null;

          return (
            <button
              key={friend.userId}
              onClick={() => onSelectFriend({ userId: friend.userId, username: friend.username })}
              className="flex flex-col items-center gap-1 min-w-[60px] group relative"
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                  friend.isOnline ? 'border-green-400' : 'border-white/20'
                } group-hover:scale-105 transition-transform`}>
                  {friend.avatar ? (
                    <Image src={friend.avatar} alt={friend.username} width={48} height={48} className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {friend.username[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(friend.userId); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition-transform"
                  title="Remove from favorites"
                >
                  ★
                </button>
              </div>
              <span className="text-white text-[10px] truncate max-w-[56px]">
                @{friend.username}
              </span>
              {dist !== null && (
                <span className="text-white/30 text-[9px]">{formatDistance(dist)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
