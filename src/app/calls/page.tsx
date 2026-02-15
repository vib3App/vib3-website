'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { callsApi } from '@/services/api/calls';
import { useVideoCall } from '@/hooks/useVideoCall';
import { TopNav } from '@/components/ui/TopNav';
import { VideoCallModal, IncomingCallModal } from '@/components/call';
import type { Call, CallType } from '@/types/call';
import { logger } from '@/utils/logger';

function formatCallTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function CallItem({ call, currentUserId, onCallBack }: { call: Call; currentUserId: string; onCallBack: (receiverId: string, type: CallType) => void }) {
  const isOutgoing = call.callerId === currentUserId;
  const otherUser = isOutgoing
    ? { username: call.receiverUsername, avatar: call.receiverAvatar }
    : { username: call.callerUsername, avatar: call.callerAvatar };

  const statusIcon = () => {
    if (call.status === 'missed') {
      return <span className="text-red-400 text-xs">Missed</span>;
    }
    if (call.status === 'declined') {
      return <span className="text-orange-400 text-xs">Declined</span>;
    }
    if (isOutgoing) {
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    );
  };

  return (
    <div className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden glass">
          {otherUser.avatar ? (
            <Image
              src={otherUser.avatar}
              alt={otherUser.username}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-lg font-medium">
              {otherUser.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-white font-medium truncate">{otherUser.username}</span>
          {statusIcon()}
        </div>
        <div className="flex items-center gap-2 text-white/50 text-sm">
          {call.type === 'video' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          )}
          <span>{formatCallTime(call.createdAt)}</span>
          {call.duration && (
            <>
              <span>•</span>
              <span>{formatDuration(call.duration)}</span>
            </>
          )}
        </div>
      </div>

      {/* Call back button */}
      <button
        onClick={() => {
          const receiverId = isOutgoing ? call.receiverId : call.callerId;
          onCallBack(receiverId, call.type);
        }}
        className="w-10 h-10 rounded-full glass flex items-center justify-center text-green-400 hover:bg-white/10 transition-colors"
      >
        {call.type === 'video' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function CallsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAuthVerified } = useAuthStore();
  const call = useVideoCall();
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleCallBack = (receiverId: string, type: CallType) => {
    call.startCall(receiverId, type);
  };

  useEffect(() => {
    if (!isAuthVerified) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/calls');
      return;
    }

    loadCalls();
  }, [isAuthenticated, isAuthVerified, router]);

  const loadCalls = async () => {
    try {
      const { calls: callList } = await callsApi.getCallHistory();
      setCalls(callList);
    } catch (error) {
      logger.error('Failed to load calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg pb-20">
      {/* Incoming Call Modal */}
      {call.incomingCall && (
        <IncomingCallModal
          call={call.incomingCall}
          onAnswer={call.answerCall}
          onDecline={call.declineCall}
        />
      )}

      {/* Active Call Modal */}
      {call.activeCall && (
        <VideoCallModal
          call={call.activeCall}
          isOutgoing={call.activeCall.callerId === user?.id}
          localVideoRef={call.localVideoRef}
          remoteVideoRef={call.remoteVideoRef}
          isMuted={call.isMuted}
          isVideoOff={call.isVideoOff}
          isSpeakerOn={call.isSpeakerOn}
          callDuration={call.formattedDuration}
          onToggleMute={call.toggleMute}
          onToggleVideo={call.toggleVideo}
          onToggleSpeaker={call.toggleSpeaker}
          onSwitchCamera={call.switchCamera}
          onEndCall={call.endCall}
        />
      )}

      <TopNav />

      <div className="pt-20 md:pt-16">
        {/* Header */}
        <header className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.back()} className="text-white/70 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Calls</h1>
          </div>
        </header>

        {/* Call History */}
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          ) : calls.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <p className="text-white/50">No calls yet</p>
              <p className="text-white/30 text-sm mt-1">
                Start a video or audio call from a conversation
              </p>
            </div>
          ) : (
            calls.map(c => (
              <CallItem key={c.id} call={c} currentUserId={user?.id || ''} onCallBack={handleCallBack} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
