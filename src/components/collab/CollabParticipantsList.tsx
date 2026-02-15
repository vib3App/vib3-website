'use client';

import Image from 'next/image';
import { UserGroupIcon, CheckCircleIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import type { CollabParticipant } from '@/types/collaboration';

interface CollabParticipantsListProps {
  participants: CollabParticipant[];
  description?: string;
  inviteCode?: string;
  copied: boolean;
  onCopyCode: () => void;
}

export function CollabParticipantsList({
  participants,
  description,
  inviteCode,
  copied,
  onCopyCode,
}: CollabParticipantsListProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/5 rounded-2xl p-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <UserGroupIcon className="w-5 h-5" />
          Participants ({participants.length})
        </h2>

        <div className="space-y-3">
          {participants.map((participant) => (
            <ParticipantCard key={participant.userId} participant={participant} />
          ))}
        </div>
      </div>

      {description && (
        <div className="bg-white/5 rounded-2xl p-4">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      )}

      {inviteCode && (
        <div className="bg-white/5 rounded-2xl p-4">
          <h2 className="font-semibold mb-2">Invite Code</h2>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-black/50 rounded-lg text-lg tracking-widest font-mono text-center">
              {inviteCode}
            </code>
            <button onClick={onCopyCode} className="p-2 hover:bg-white/10 rounded-lg transition" aria-label={copied ? "Copied" : "Copy invite code"}>
              {copied ? (
                <CheckIcon className="w-5 h-5 text-green-400" />
              ) : (
                <ClipboardIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ParticipantCard({ participant }: { participant: CollabParticipant }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
          {participant.avatar ? (
            <Image src={participant.avatar} alt={participant.username + "'s avatar"} width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm font-bold">
              {participant.username[0].toUpperCase()}
            </div>
          )}
        </div>
        {participant.isReady && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <CheckIcon className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="font-medium flex items-center gap-2">
          {participant.username}
          {participant.role === 'creator' && (
            <span className="text-xs px-2 py-0.5 bg-pink-500/20 text-pink-400 rounded-full">
              Host
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400">
          {participant.hasRecorded ? 'Submitted' : participant.isReady ? 'Ready' : 'Waiting'}
        </div>
      </div>

      {participant.hasRecorded && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
    </div>
  );
}
