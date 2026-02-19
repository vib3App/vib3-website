'use client';

import { useState } from 'react';
import {
  HeartIcon,
  FaceSmileIcon,
  GiftIcon,
  UserPlusIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  ShareIcon,
  FireIcon,
  HandThumbUpIcon,
  SparklesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { InviteFollowersModal } from './InviteFollowersModal';

const REACTIONS = [
  { type: 'like' as const, icon: HandThumbUpIcon, color: 'text-blue-400' },
  { type: 'heart' as const, icon: HeartSolidIcon, color: 'text-red-500' },
  { type: 'fire' as const, icon: FireIcon, color: 'text-orange-500' },
  { type: 'laugh' as const, icon: FaceSmileIcon, color: 'text-yellow-400' },
  { type: 'wow' as const, icon: SparklesIcon, color: 'text-purple-400' },
  { type: 'clap' as const, icon: '👏', color: '' },
];

interface HostControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  guestRequestCount: number;
  streamId?: string;
  isRecording?: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onShowGuestRequests: () => void;
  onEndStream: () => void;
  onToggleRecording?: () => void;
}

export function HostControls({
  audioEnabled,
  videoEnabled,
  guestRequestCount,
  streamId,
  isRecording = false,
  onToggleAudio,
  onToggleVideo,
  onShowGuestRequests,
  onEndStream,
  onToggleRecording,
}: HostControlsProps) {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onToggleAudio}
        className={`p-3 rounded-full ${audioEnabled ? 'bg-white/20' : 'bg-red-500'}`}
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full ${videoEnabled ? 'bg-white/20' : 'bg-red-500'}`}
      >
        <VideoCameraIcon className="w-5 h-5" />
      </button>
      {/* Gap #60: Record toggle */}
      {onToggleRecording && (
        <button
          onClick={onToggleRecording}
          className={`p-3 rounded-full transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20 hover:bg-white/30'}`}
          title={isRecording ? 'Stop Recording' : 'Record Stream'}
        >
          {isRecording ? (
            <div className="w-5 h-5 flex items-center justify-center"><div className="w-3 h-3 bg-white rounded-sm" /></div>
          ) : (
            <div className="w-5 h-5 flex items-center justify-center"><div className="w-3 h-3 bg-red-500 rounded-full" /></div>
          )}
        </button>
      )}
      <button
        onClick={onShowGuestRequests}
        className="relative p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
      >
        <UserPlusIcon className="w-5 h-5" />
        {guestRequestCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
            {guestRequestCount}
          </span>
        )}
      </button>
      {/* Gap #61: Invite followers */}
      {streamId && (
        <button
          onClick={() => setShowInvite(true)}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
          title="Invite Followers"
        >
          <UsersIcon className="w-5 h-5" />
        </button>
      )}
      <button
        onClick={onEndStream}
        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full font-medium transition"
      >
        End
      </button>
      {/* Gap #61: Invite modal */}
      {streamId && (
        <InviteFollowersModal
          isOpen={showInvite}
          onClose={() => setShowInvite(false)}
          streamId={streamId}
        />
      )}
    </div>
  );
}

interface ViewerControlsProps {
  allowGuests: boolean;
  onRequestToJoin: () => void;
}

export function ViewerControls({ allowGuests, onRequestToJoin }: ViewerControlsProps) {
  if (!allowGuests) return <div />;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onRequestToJoin}
        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition"
      >
        <UserPlusIcon className="w-5 h-5" />
        Join
      </button>
    </div>
  );
}

interface ActionButtonsProps {
  isLiked: boolean;
  showReactions: boolean;
  onLike: () => void;
  onToggleReactions: () => void;
  onShowGifts: () => void;
  onReaction: (type: 'like' | 'heart' | 'fire' | 'laugh' | 'wow' | 'clap') => void;
}

export function ActionButtons({
  isLiked,
  showReactions,
  onLike,
  onToggleReactions,
  onShowGifts,
  onReaction,
}: ActionButtonsProps) {
  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={onLike}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          {isLiked ? (
            <HeartSolidIcon className="w-6 h-6 text-red-500" />
          ) : (
            <HeartIcon className="w-6 h-6" />
          )}
        </button>
        <button
          onClick={onToggleReactions}
          className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
        >
          <FaceSmileIcon className="w-6 h-6" />
        </button>
        <button
          onClick={onShowGifts}
          className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition hover:opacity-90"
        >
          <GiftIcon className="w-6 h-6" />
        </button>
        <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition" aria-label="Share">
          <ShareIcon className="w-6 h-6" />
        </button>
      </div>

      {showReactions && (
        <div className="absolute bottom-20 right-4 flex items-center gap-2 p-2 bg-black/80 rounded-full">
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => onReaction(reaction.type)}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              {typeof reaction.icon === 'string' ? (
                <span className="text-xl">{reaction.icon}</span>
              ) : (
                <reaction.icon className={`w-6 h-6 ${reaction.color}`} />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
