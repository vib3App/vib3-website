'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Hls from 'hls.js';
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  PlusIcon,
  QueueListIcon,
  UserGroupIcon,
  PaperAirplaneIcon,
  ShareIcon,
  ClipboardIcon,
  XMarkIcon,
  TrashIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { collaborationApi, videoApi } from '@/services/api';
import type { WatchParty, WatchPartyChatMessage, WatchPartyParticipant } from '@/types/collaboration';

export default function WatchPartyRoom() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Party data
  const [party, setParty] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<WatchPartyChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [chatMessage, setChatMessage] = useState('');
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Add video modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; thumbnail?: string }>>([]);
  const [searching, setSearching] = useState(false);

  // Is current user the host
  const isHost = party?.hostId === 'current-user-id'; // Replace with actual auth

  // Fetch party data
  useEffect(() => {
    const fetchParty = async () => {
      try {
        const data = await collaborationApi.getWatchParty(partyId);
        setParty(data);

        // Setup video playback
        if (data.playlist.length > 0 && videoRef.current) {
          const currentVideo = data.playlist[data.currentVideoIndex];
          // In production, fetch video URL
          // For now, simulate with placeholder
        }
      } catch (err) {
        console.error('Failed to fetch party:', err);
        setError('Watch party not found');
      } finally {
        setLoading(false);
      }
    };

    fetchParty();

    // Poll for updates (in production, use WebSocket)
    const interval = setInterval(fetchParty, 2000);
    return () => clearInterval(interval);
  }, [partyId]);

  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const msgs = await collaborationApi.getWatchPartyChat(partyId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [partyId]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Sync video position
  useEffect(() => {
    if (!party || !videoRef.current) return;

    // Sync playback state
    if (party.status === 'playing') {
      videoRef.current.play();
    } else if (party.status === 'paused') {
      videoRef.current.pause();
    }

    // Sync position (with tolerance)
    const currentTime = videoRef.current.currentTime;
    if (Math.abs(currentTime - party.currentPosition) > 2) {
      videoRef.current.currentTime = party.currentPosition;
    }
  }, [party?.status, party?.currentPosition]);

  // Send chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    try {
      const msg = await collaborationApi.sendChatMessage(partyId, chatMessage.trim());
      setMessages(prev => [...prev, msg]);
      setChatMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Host controls
  const handlePlayPause = async () => {
    if (!party || !isHost) return;

    try {
      await collaborationApi.setPlaybackState(partyId, party.status !== 'playing');
    } catch (err) {
      console.error('Failed to set playback state:', err);
    }
  };

  const handleSkipNext = async () => {
    if (!isHost) return;

    try {
      await collaborationApi.skipToNext(partyId);
    } catch (err) {
      console.error('Failed to skip:', err);
    }
  };

  const handleSkipToVideo = async (index: number) => {
    if (!isHost) return;

    try {
      await collaborationApi.skipToVideo(partyId, index);
    } catch (err) {
      console.error('Failed to skip:', err);
    }
  };

  const handleRemoveFromPlaylist = async (videoId: string) => {
    if (!isHost) return;

    try {
      await collaborationApi.removeFromPlaylist(partyId, videoId);
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  // Add video to playlist
  const handleAddVideo = async (videoId: string) => {
    try {
      await collaborationApi.addToPlaylist(partyId, videoId);
      setShowAddVideoModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      console.error('Failed to add video:', err);
    }
  };

  // Search videos
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // In production, search for videos
      // For now, simulate with placeholder
      setSearchResults([
        { id: '1', title: 'Sample Video 1', thumbnail: undefined },
        { id: '2', title: 'Sample Video 2', thumbnail: undefined },
      ]);
    } catch (err) {
      console.error('Failed to search:', err);
    } finally {
      setSearching(false);
    }
  };

  // Leave party
  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave?')) return;

    try {
      await collaborationApi.leaveWatchParty(partyId);
      router.push('/watch-party');
    } catch (err) {
      console.error('Failed to leave:', err);
    }
  };

  // End party (host only)
  const handleEndParty = async () => {
    if (!confirm('Are you sure you want to end the party?')) return;

    try {
      await collaborationApi.endWatchParty(partyId);
      router.push('/watch-party');
    } catch (err) {
      console.error('Failed to end party:', err);
    }
  };

  // Share
  const copyShareLink = () => {
    const url = `${window.location.origin}/watch-party/${partyId}`;
    navigator.clipboard.writeText(party?.inviteCode ? `${url}?code=${party.inviteCode}` : url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <UserGroupIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">{error || 'Party not found'}</h1>
        <Link href="/watch-party" className="text-pink-400 hover:underline">
          Back to Watch Parties
        </Link>
      </div>
    );
  }

  const currentVideo = party.playlist[party.currentVideoIndex];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/watch-party" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold">{party.title}</h1>
              <div className="text-xs text-gray-400">
                {party.participants.length} watching
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ShareIcon className="w-5 h-5" />
            </button>

            {isHost ? (
              <button
                onClick={handleEndParty}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-medium transition"
              >
                End Party
              </button>
            ) : (
              <button
                onClick={handleLeave}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-medium transition"
              >
                Leave
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video & Playlist */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="relative bg-black flex-1 flex items-center justify-center">
            {currentVideo ? (
              <video
                ref={videoRef}
                className="max-w-full max-h-full"
                playsInline
              />
            ) : (
              <div className="text-center">
                <QueueListIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No videos in playlist</p>
                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-full text-sm font-medium transition"
                >
                  Add Videos
                </button>
              </div>
            )}

            {/* Video Controls (Host only) */}
            {isHost && currentVideo && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/80 rounded-full">
                <button
                  onClick={() => handleSkipToVideo(Math.max(0, party.currentVideoIndex - 1))}
                  disabled={party.currentVideoIndex === 0}
                  className="p-2 hover:bg-white/20 disabled:opacity-50 rounded-full transition"
                >
                  <BackwardIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-3 bg-white text-black rounded-full hover:opacity-90 transition"
                >
                  {party.status === 'playing' ? (
                    <PauseIcon className="w-6 h-6" />
                  ) : (
                    <PlayIcon className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={handleSkipNext}
                  disabled={party.currentVideoIndex >= party.playlist.length - 1}
                  className="p-2 hover:bg-white/20 disabled:opacity-50 rounded-full transition"
                >
                  <ForwardIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Playlist Toggle */}
          <div className="border-t border-white/10">
            <button
              onClick={() => setShowPlaylist(!showPlaylist)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition"
            >
              <div className="flex items-center gap-2">
                <QueueListIcon className="w-5 h-5" />
                <span className="font-medium">Playlist</span>
                <span className="text-sm text-gray-400">({party.playlist.length} videos)</span>
              </div>
              <Bars3Icon className={`w-5 h-5 transition ${showPlaylist ? 'rotate-180' : ''}`} />
            </button>

            {showPlaylist && (
              <div className="max-h-48 overflow-y-auto border-t border-white/10">
                {party.playlist.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No videos yet
                  </div>
                ) : (
                  party.playlist.map((video, index) => (
                    <div
                      key={video.videoId}
                      className={`flex items-center gap-3 p-3 hover:bg-white/5 transition ${
                        index === party.currentVideoIndex ? 'bg-pink-500/20' : ''
                      }`}
                    >
                      <div className="w-16 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {video.videoThumbnail ? (
                          <img src={video.videoThumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{video.videoTitle}</div>
                        <div className="text-xs text-gray-400">
                          Added by {video.addedBy}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isHost && index !== party.currentVideoIndex && (
                          <>
                            <button
                              onClick={() => handleSkipToVideo(index)}
                              className="p-2 hover:bg-white/10 rounded-full transition"
                              title="Play now"
                            >
                              <PlayIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromPlaylist(video.videoId)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition"
                              title="Remove"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}

                <button
                  onClick={() => setShowAddVideoModal(true)}
                  className="w-full p-3 flex items-center justify-center gap-2 hover:bg-white/5 text-pink-400 transition"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Video
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 border-l border-white/10 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setShowParticipants(false)}
              className={`flex-1 p-3 text-sm font-medium transition ${
                !showParticipants ? 'border-b-2 border-pink-500' : 'text-gray-400'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setShowParticipants(true)}
              className={`flex-1 p-3 text-sm font-medium transition ${
                showParticipants ? 'border-b-2 border-pink-500' : 'text-gray-400'
              }`}
            >
              People ({party.participants.length})
            </button>
          </div>

          {showParticipants ? (
            // Participants List
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {party.participants.map((participant: WatchPartyParticipant) => (
                <div
                  key={participant.userId}
                  className="flex items-center gap-3 p-2"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 overflow-hidden">
                      {participant.avatar ? (
                        <img src={participant.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                          {participant.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    {participant.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {participant.username}
                      {participant.isHost && (
                        <span className="text-xs px-1.5 py-0.5 bg-pink-500/20 text-pink-400 rounded">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {participant.isOnline ? 'Watching' : 'Away'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Chat Messages
            <>
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
                      <div className="text-sm font-medium">{msg.username}</div>
                      {msg.type === 'system' ? (
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
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-full focus:outline-none focus:border-pink-500 text-sm"
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
            </>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Share Party</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {party.inviteCode && (
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Invite Code</label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-4 py-3 bg-black/50 rounded-lg text-xl tracking-widest font-mono text-center">
                      {party.inviteCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(party.inviteCode!);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                      {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={copyShareLink}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:opacity-90 transition"
              >
                {copied ? 'Link Copied!' : 'Copy Share Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Video</h2>
              <button
                onClick={() => {
                  setShowAddVideoModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="p-2 hover:bg-white/10 rounded-full transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSearch} className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for videos..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
                />
              </form>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Search for videos to add
                  </div>
                ) : (
                  searchResults.map(video => (
                    <button
                      key={video.id}
                      onClick={() => handleAddVideo(video.id)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 rounded-lg transition"
                    >
                      <div className="w-16 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PlayIcon className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm truncate">{video.title}</div>
                      </div>
                      <PlusIcon className="w-5 h-5 text-pink-400" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
