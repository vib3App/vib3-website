'use client';

import Image from 'next/image';
import { BentoItem } from './BentoItem';

interface CollabRoomCardProps {
  room: {
    id: string;
    name: string;
    participants: Array<{ avatarUrl: string }>;
    isRecording?: boolean;
  };
}

export function CollabRoomCard({ room }: CollabRoomCardProps) {
  return (
    <BentoItem size="sm" href={`/collab/${room.id}`}>
      <div className="w-full h-full p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm truncate">{room.name}</h4>
          {room.isRecording && (
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="flex -space-x-2">
            {room.participants.slice(0, 4).map((p, i) => (
              <Image key={i} src={p.avatarUrl} alt="Participant avatar" width={32} height={32} className="w-8 h-8 rounded-full border-2 border-black" />
            ))}
            {room.participants.length > 4 && (
              <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-xs">
                +{room.participants.length - 4}
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <span className="text-xs text-teal-400">Join Room</span>
        </div>
      </div>
    </BentoItem>
  );
}
