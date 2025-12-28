'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';
import {
  ArrowLeftIcon,
  XMarkIcon,
  HeartIcon,
  FireIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  GiftIcon,
  UserPlusIcon,
  EllipsisVerticalIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  VideoCameraIcon,
  UserGroupIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  SignalIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { liveApi } from '@/services/api';
import type { LiveStream, LiveChatMessage, LiveGift, LiveGuest } from '@/types';

const REACTIONS = [
  { type: 'like' as const, icon: HandThumbUpIcon, color: 'text-blue-400' },
  { type: 'heart' as const, icon: HeartSolidIcon, color: 'text-red-500' },
  { type: 'fire' as const, icon: FireIcon, color: 'text-orange-500' },
  { type: 'laugh' as const, icon: FaceSmileIcon, color: 'text-yellow-400' },
  { type: 'wow' as const, icon: SparklesIcon, color: 'text-purple-400' },
  { type: 'clap' as const, icon: '👏', color: '' },
];

interface FloatingReaction {
  id: string;
  type: string;
  x: number;
}

export default function LiveStreamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const streamId = params.id as string;
  const isHost = searchParams.get('host') === 'true';

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Stream data
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [gifts, setGifts] = useState<LiveGift[]>([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [showGifts, setShowGifts] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showGuestRequests, setShowGuestRequests] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  // Host controls
  const [guestRequests, setGuestRequests] = useState<Array<{ requestId: string; userId: string; username: string; avatar?: string }>>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Fetch stream data
  useEffect(() => {
    const fetchStream = async () => {
      try {
        const data = await liveApi.getLiveStream(streamId);
        setStream(data);
        setViewerCount(data.viewerCount);
        setLikeCount(data.likeCount);

        // Setup HLS playback
        if (data.hlsUrl && videoRef.current) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
            });
            hls.loadSource(data.hlsUrl);
            hls.attachMedia(videoRef.current);
            hlsRef.current = hls;
          } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            videoRef.current.src = data.hlsUrl;
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch stream:', err);
        setError('Stream not found or has ended');
        setLoading(false);
      }
    };

    fetchStream();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [streamId]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await liveApi.getChatMessages(streamId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();

    // Poll for new messages (in production, use WebSocket)
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [streamId]);

  // Fetch gifts
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const data = await liveApi.getGifts();
        setGifts(data);
      } catch (err) {
        console.error('Failed to fetch gifts:', err);
      }
    };

    fetchGifts();
  }, []);

  // Host: Fetch guest requests
  useEffect(() => {
    if (!isHost) return;

    const fetchRequests = async () => {
      try {
        const requests = await liveApi.getGuestRequests(streamId);
        setGuestRequests(requests);
      } catch (err) {
        console.error('Failed to fetch guest requests:', err);
      }
    };

    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [streamId, isHost]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const msg = await liveApi.sendChatMessage(streamId, chatMessage.trim());
      setMessages(prev => [...prev, msg]);
      setChatMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Send reaction
  const handleReaction = async (type: 'like' | 'heart' | 'fire' | 'laugh' | 'wow' | 'clap') => {
    try {
      await liveApi.sendReaction(streamId, type);

      // Add floating reaction
      const id = Date.now().toString();
      setFloatingReactions(prev => [...prev, { id, type, x: Math.random() * 80 + 10 }]);

      // Remove after animation
      setTimeout(() => {
        setFloatingReactions(prev => prev.filter(r => r.id !== id));
      }, 2000);
    } catch (err) {
      console.error('Failed to send reaction:', err);
    }
  };

  // Send gift
  const handleSendGift = async (giftId: string) => {
    try {
      await liveApi.sendGift(streamId, giftId, 1);
      setShowGifts(false);
    } catch (err) {
      console.error('Failed to send gift:', err);
    }
  };

  // Like stream
  const handleLike = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      handleReaction('heart');
    }
  };

  // Request to join
  const handleRequestToJoin = async () => {
    try {
      await liveApi.requestToJoin(streamId);
      alert('Join request sent!');
    } catch (err) {
      console.error('Failed to request to join:', err);
    }
  };

  // Host: Accept guest
  const handleAcceptGuest = async (requestId: string) => {
    try {
      await liveApi.acceptGuest(streamId, requestId);
      setGuestRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (err) {
      console.error('Failed to accept guest:', err);
    }
  };

  // Host: Reject guest
  const handleRejectGuest = async (requestId: string) => {
    try {
      await liveApi.rejectGuest(streamId, requestId);
      setGuestRequests(prev => prev.filter(r => r.requestId !== requestId));
    } catch (err) {
      console.error('Failed to reject guest:', err);
    }
  };

  // Host: End stream
  const handleEndStream = async () => {
    if (!confirm('Are you sure you want to end the stream?')) return;

    try {
      await liveApi.endStream(streamId);
      router.push('/live');
    } catch (err) {
      console.error('Failed to end stream:', err);
    }
  };

  // Render reaction icon
  const renderReactionIcon = (type: string) => {
    const reaction = REACTIONS.find(r => r.type === type);
    if (!reaction) return null;

    if (typeof reaction.icon === 'string') {
      return <span className="text-2xl">{reaction.icon}</span>;
    }

    const Icon = reaction.icon;
    return <Icon className={`w-6 h-6 ${reaction.color}`} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <ExclamationTriangleIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{error || 'Stream not found'}</h1>
        <Link href="/live" className="text-pink-400 hover:underline">
          Back to Live
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Video Section */}
        <div className="flex-1 relative">
          {/* Video Player */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />

          {/* Floating Reactions */}
          <div className="absolute bottom-20 right-4 w-16 h-64 pointer-events-none overflow-hidden">
            {floatingReactions.map(reaction => (
              <div
                key={reaction.id}
                className="absolute animate-float-up"
                style={{ left: `${reaction.x}%`, bottom: 0 }}
              >
                {renderReactionIcon(reaction.type)}
              </div>
            ))}
          </div>

          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/live" className="p-2 hover:bg-white/10 rounded-full transition">
                  <ArrowLeftIcon className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                    {stream.hostAvatar ? (
                      <img src={stream.hostAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                        {stream.hostUsername[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{stream.hostUsername}</div>
                    <div className="text-xs text-gray-400">{stream.title}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full text-sm">
                  <SignalIcon className="w-4 h-4" />
                  LIVE
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                  <UserGroupIcon className="w-4 h-4" />
                  {viewerCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              {/* Left: Host controls or viewer actions */}
              {isHost ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-3 rounded-full ${audioEnabled ? 'bg-white/20' : 'bg-red-500'}`}
                  >
                    <MicrophoneIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={`p-3 rounded-full ${videoEnabled ? 'bg-white/20' : 'bg-red-500'}`}
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowGuestRequests(true)}
                    className="relative p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                  >
                    <UserPlusIcon className="w-5 h-5" />
                    {guestRequests.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {guestRequests.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={handleEndStream}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-full font-medium transition"
                  >
                    End
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {stream.allowGuests && (
                    <button
                      onClick={handleRequestToJoin}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                      Join
                    </button>
                  )}
                </div>
              )}

              {/* Right: Reactions & Gifts */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                >
                  {isLiked ? (
                    <HeartSolidIcon className="w-6 h-6 text-red-500" />
                  ) : (
                    <HeartIcon className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition"
                >
                  <FaceSmileIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setShowGifts(true)}
                  className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition hover:opacity-90"
                >
                  <GiftIcon className="w-6 h-6" />
                </button>

                <button className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition">
                  <ShareIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Reactions Popup */}
            {showReactions && (
              <div className="absolute bottom-20 right-4 flex items-center gap-2 p-2 bg-black/80 rounded-full">
                {REACTIONS.map(reaction => (
                  <button
                    key={reaction.type}
                    onClick={() => {
                      handleReaction(reaction.type);
                      setShowReactions(false);
                    }}
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
          </div>

          {/* Guests Grid */}
          {stream.guests.length > 0 && (
            <div className="absolute top-20 right-4 space-y-2">
              {stream.guests.map((guest: LiveGuest) => (
                <div
                  key={guest.userId}
                  className="w-24 aspect-video bg-gray-800 rounded-lg overflow-hidden relative"
                >
                  {guest.avatar ? (
                    <img src={guest.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs">
                      {guest.username}
                    </div>
                  )}
                  {guest.isMuted && (
                    <div className="absolute bottom-1 right-1 p-1 bg-red-500 rounded-full">
                      <MicrophoneIcon className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Section */}
        <div className="w-full lg:w-96 h-80 lg:h-full flex flex-col bg-gray-900/50 border-l border-white/10">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Live Chat</h3>
              <span className="text-sm text-gray-400">{messages.length} messages</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map(msg => (
              <div key={msg.id} className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex-shrink-0 overflow-hidden">
                  {msg.avatar ? (
                    <img src={msg.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                      {msg.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.username}</span>
                    {msg.type === 'gift' && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                        Gift
                      </span>
                    )}
                  </div>
                  {msg.type === 'gift' ? (
                    <div className="text-sm text-yellow-400">
                      Sent {msg.giftName} ×{msg.giftValue}
                    </div>
                  ) : msg.type === 'join' ? (
                    <div className="text-sm text-gray-400">joined the stream</div>
                  ) : msg.type === 'system' ? (
                    <div className="text-sm text-gray-400 italic">{msg.content}</div>
                  ) : (
                    <div className="text-sm text-gray-200 break-words">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Say something..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-pink-500"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="p-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Gifts Modal */}
      {showGifts && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/80">
          <div className="w-full max-w-md bg-gray-900 rounded-t-3xl lg:rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Send a Gift</h3>
              <button
                onClick={() => setShowGifts(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-4 gap-4 max-h-64 overflow-y-auto">
              {gifts.map(gift => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift.id)}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-white/10 rounded-xl transition"
                >
                  <img src={gift.iconUrl} alt={gift.name} className="w-12 h-12 object-contain" />
                  <div className="text-xs font-medium">{gift.name}</div>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    <span>💰</span>
                    {gift.coinValue}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Guest Requests Modal (Host only) */}
      {showGuestRequests && isHost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Guest Requests</h3>
              <button
                onClick={() => setShowGuestRequests(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {guestRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No pending requests
                </div>
              ) : (
                guestRequests.map(request => (
                  <div
                    key={request.requestId}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                      {request.avatar ? (
                        <img src={request.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                          {request.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{request.username}</div>
                      <div className="text-sm text-gray-400">wants to join</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectGuest(request.requestId)}
                        className="p-2 hover:bg-white/10 rounded-full transition text-red-400"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleAcceptGuest(request.requestId)}
                        className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition"
                      >
                        <UserPlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSS for floating animation */}
      <style jsx global>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-200px) scale(1.5);
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
