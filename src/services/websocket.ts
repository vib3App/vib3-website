/**
 * WebSocket Service for real-time communication
 * Uses Socket.IO client to match the backend's Socket.IO server
 */
import { io, Socket } from 'socket.io-client';
import { config } from '@/config/env';
import type { Message, TypingIndicator } from '@/types';
import type { IncomingCall, CallEndedEvent } from '@/types/call';
import { logger } from '@/utils/logger';

type MessageHandler = (message: Message) => void;
type TypingHandler = (indicator: TypingIndicator) => void;
type PresenceHandler = (userId: string, isOnline: boolean) => void;
type NotificationHandler = (notification: Notification) => void;
type ConnectionHandler = (connected: boolean) => void;
type IncomingCallHandler = (call: IncomingCall) => void;
type CallEndedHandler = (event: CallEndedEvent) => void;
type CallAcceptedHandler = (data: { callId: string }) => void;
type CallRejectedHandler = (data: { callId: string; reason: string }) => void;
type CallRegisteredHandler = (data: { callId: string }) => void;
type CallSignalHandler = (data: { callId: string; type: string; sdp?: string; iceCandidate?: RTCIceCandidateInit; fromUserId: string; toUserId: string }) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericHandler = (data: any) => void;

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

/** Gap #76: Queued message when disconnected */
interface QueuedMessage {
  event: string;
  data: unknown;
  timestamp: number;
}

const SOCKET_URL = config.api.socketUrl;
const MAX_QUEUE_SIZE = 50;

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private typingHandlers: Set<TypingHandler> = new Set();
  private presenceHandlers: Set<PresenceHandler> = new Set();
  private notificationHandlers: Set<NotificationHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private incomingCallHandlers: Set<IncomingCallHandler> = new Set();
  private callEndedHandlers: Set<CallEndedHandler> = new Set();
  private callAcceptedHandlers: Set<CallAcceptedHandler> = new Set();
  private callRejectedHandlers: Set<CallRejectedHandler> = new Set();
  private callRegisteredHandlers: Set<CallRegisteredHandler> = new Set();
  private callSignalHandlers: Set<CallSignalHandler> = new Set();
  private battleStartHandlers: Set<GenericHandler> = new Set();
  private battleUpdateHandlers: Set<GenericHandler> = new Set();
  private battleEndHandlers: Set<GenericHandler> = new Set();
  private giftReceivedHandlers: Set<GenericHandler> = new Set();
  private locationUpdateHandlers: Set<GenericHandler> = new Set();
  private currentToken: string | null = null;

  /** Gap #76: Message queue for offline buffering */
  private messageQueue: QueuedMessage[] = [];

  /** Gap #82: Collab event handlers */
  private collabJoinHandlers: Set<GenericHandler> = new Set();
  private collabLeaveHandlers: Set<GenericHandler> = new Set();
  private collabStateHandlers: Set<GenericHandler> = new Set();
  private collabChatHandlers: Set<GenericHandler> = new Set();
  private collabReactionHandlers: Set<GenericHandler> = new Set();

  /**
   * Connect to Socket.IO server
   */
  connect(token: string): void {
    // Don't reconnect if already connected with same token
    if (this.socket?.connected && this.currentToken === token) {
      return;
    }

    // Disconnect existing connection
    if (this.socket) {
      this.socket.disconnect();
    }

    this.currentToken = token;

    try {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        this.notifyConnectionHandlers(true);
        // Gap #76: Flush queued messages on reconnect
        this.flushQueue();
      });

      this.socket.on('disconnect', (_reason) => {
        this.notifyConnectionHandlers(false);
      });

      this.socket.on('connect_error', (error) => {
        logger.error('Socket.IO connection error:', error.message);
      });

      // Message events
      this.socket.on('message', (data: Message) => {
        this.messageHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('new_message', (data: Message) => {
        this.messageHandlers.forEach((handler) => handler(data));
      });

      // Typing events
      this.socket.on('typing', (data: TypingIndicator) => {
        this.typingHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('user:typing', (data: TypingIndicator) => {
        this.typingHandlers.forEach((handler) => handler(data));
      });

      // GAP-06: Also listen for Flutter-format typing events
      this.socket.on('typing:start', (data: { conversationId: string; userId?: string; username?: string }) => {
        this.typingHandlers.forEach((handler) => handler({ conversationId: data.conversationId, userId: data.userId || '', isTyping: true, username: data.username || data.userId || '' }));
      });
      this.socket.on('typing:stop', (data: { conversationId: string; userId?: string; username?: string }) => {
        this.typingHandlers.forEach((handler) => handler({ conversationId: data.conversationId, userId: data.userId || '', isTyping: false, username: data.username || data.userId || '' }));
      });

      // Presence events
      this.socket.on('presence', (data: { userId: string; isOnline: boolean }) => {
        this.presenceHandlers.forEach((handler) => handler(data.userId, data.isOnline));
      });

      this.socket.on('user:status', (data: { userId: string; status: string }) => {
        this.presenceHandlers.forEach((handler) => handler(data.userId, data.status === 'online'));
      });

      // GAP-08: Also listen for Flutter-format presence event
      this.socket.on('user:online', (data: { userId: string; isOnline?: boolean }) => {
        this.presenceHandlers.forEach((handler) => handler(data.userId, data.isOnline !== false));
      });

      // Notification events
      this.socket.on('notification', (data: Notification) => {
        this.notificationHandlers.forEach((handler) => handler(data));
      });

      // Call events (matching backend socket event names)
      this.socket.on('call:incoming', (data: IncomingCall) => {
        this.incomingCallHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('call:ended', (data: CallEndedEvent) => {
        this.callEndedHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('call:accepted', (data: { callId: string }) => {
        this.callAcceptedHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('call:rejected', (data: { callId: string; reason: string }) => {
        this.callRejectedHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('call:registered', (data: { callId: string }) => {
        this.callRegisteredHandlers.forEach((handler) => handler(data));
      });

      this.socket.on('call:signal', (data: { callId: string; type: string; sdp?: string; iceCandidate?: RTCIceCandidateInit; fromUserId: string; toUserId: string }) => {
        this.callSignalHandlers.forEach((handler) => handler(data));
      });

      // Battle events
      this.socket.on('battle:start', (data: unknown) => {
        this.battleStartHandlers.forEach((handler) => handler(data));
      });
      this.socket.on('battle:update', (data: unknown) => {
        this.battleUpdateHandlers.forEach((handler) => handler(data));
      });
      this.socket.on('battle:end', (data: unknown) => {
        this.battleEndHandlers.forEach((handler) => handler(data));
      });

      // Gift events
      this.socket.on('gift:received', (data: unknown) => {
        this.giftReceivedHandlers.forEach((handler) => handler(data));
      });

      // Location events
      this.socket.on('location:update', (data: unknown) => {
        this.locationUpdateHandlers.forEach((handler) => handler(data));
      });

      // Gap #82: Collab room events
      this.socket.on('collab:join', (data: unknown) => {
        this.collabJoinHandlers.forEach((handler) => handler(data));
      });
      this.socket.on('collab:leave', (data: unknown) => {
        this.collabLeaveHandlers.forEach((handler) => handler(data));
      });
      this.socket.on('collab:state', (data: unknown) => {
        this.collabStateHandlers.forEach((handler) => handler(data));
      });
      this.socket.on('collab:chat', (data: unknown) => {
        this.collabChatHandlers.forEach((handler) => handler(data));
      });
      this.socket.on('collab:reaction', (data: unknown) => {
        this.collabReactionHandlers.forEach((handler) => handler(data));
      });

    } catch (error) {
      logger.error('Failed to create Socket.IO connection:', error);
    }
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
  }

  /**
   * Emit an event through Socket.IO
   * Gap #76: Queues messages when disconnected, flushes on reconnect
   */
  send(type: string, payload: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(type, payload);
    } else {
      // Queue the message for later delivery
      if (this.messageQueue.length >= MAX_QUEUE_SIZE) {
        this.messageQueue.shift(); // drop oldest
      }
      this.messageQueue.push({ event: type, data: payload, timestamp: Date.now() });
    }
  }

  /** Gap #76: Flush queued messages in order */
  private flushQueue(): void {
    if (!this.socket?.connected || this.messageQueue.length === 0) return;
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    for (const msg of queue) {
      this.socket.emit(msg.event, msg.data);
    }
    logger.info(`[WebSocket] Flushed ${queue.length} queued message(s)`);
  }

  /** Gap #76: Get queue size for UI display */
  getQueueSize(): number {
    return this.messageQueue.length;
  }

  /**
   * Send typing indicator
   * GAP-06: Emit both web format (typing) and Flutter format (typing:start/typing:stop)
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    this.send('typing', { conversationId, isTyping });
    // Also emit Flutter-compatible events
    this.send(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
  }

  /**
   * Mark conversation as read
   * GAP-07: Emit both web format (mark_read) and Flutter format (chat:read + message:read)
   */
  sendRead(conversationId: string, messageId: string): void {
    this.send('mark_read', { conversationId, messageId });
    // Also emit Flutter-compatible events
    this.send('chat:read', { conversationId, messageId });
    this.send('message:read', { conversationId, messageId });
  }

  /**
   * Join a chat room
   */
  joinChat(chatId: string): void {
    this.send('join_chat', { chatId });
  }

  /**
   * Leave a chat room
   */
  leaveChat(chatId: string): void {
    this.send('leave_chat', { chatId });
  }

  /**
   * Subscribe to new messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  /**
   * Subscribe to presence updates
   */
  onPresence(handler: PresenceHandler): () => void {
    this.presenceHandlers.add(handler);
    return () => this.presenceHandlers.delete(handler);
  }

  /**
   * Subscribe to notifications
   */
  onNotification(handler: NotificationHandler): () => void {
    this.notificationHandlers.add(handler);
    return () => this.notificationHandlers.delete(handler);
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Subscribe to incoming calls
   */
  onIncomingCall(handler: IncomingCallHandler): () => void {
    this.incomingCallHandlers.add(handler);
    return () => this.incomingCallHandlers.delete(handler);
  }

  /**
   * Subscribe to call ended events
   */
  onCallEnded(handler: CallEndedHandler): () => void {
    this.callEndedHandlers.add(handler);
    return () => this.callEndedHandlers.delete(handler);
  }

  onCallAccepted(handler: CallAcceptedHandler): () => void {
    this.callAcceptedHandlers.add(handler);
    return () => this.callAcceptedHandlers.delete(handler);
  }

  onCallRejected(handler: CallRejectedHandler): () => void {
    this.callRejectedHandlers.add(handler);
    return () => this.callRejectedHandlers.delete(handler);
  }

  onCallRegistered(handler: CallRegisteredHandler): () => void {
    this.callRegisteredHandlers.add(handler);
    return () => this.callRegisteredHandlers.delete(handler);
  }

  onCallSignal(handler: CallSignalHandler): () => void {
    this.callSignalHandlers.add(handler);
    return () => this.callSignalHandlers.delete(handler);
  }

  onBattleStart(handler: GenericHandler): () => void {
    this.battleStartHandlers.add(handler);
    return () => this.battleStartHandlers.delete(handler);
  }

  onBattleUpdate(handler: GenericHandler): () => void {
    this.battleUpdateHandlers.add(handler);
    return () => this.battleUpdateHandlers.delete(handler);
  }

  onBattleEnd(handler: GenericHandler): () => void {
    this.battleEndHandlers.add(handler);
    return () => this.battleEndHandlers.delete(handler);
  }

  onGiftReceived(handler: GenericHandler): () => void {
    this.giftReceivedHandlers.add(handler);
    return () => this.giftReceivedHandlers.delete(handler);
  }

  onLocationUpdate(handler: GenericHandler): () => void {
    this.locationUpdateHandlers.add(handler);
    return () => this.locationUpdateHandlers.delete(handler);
  }

  /**
   * Subscribe to a generic event by name (for custom events like message:reaction)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, handler: (data: any) => void): () => void {
    if (this.socket) {
      this.socket.on(event, handler);
    }
    return () => {
      if (this.socket) {
        this.socket.off(event, handler);
      }
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /** Gap #82: Collab room event subscriptions */
  onCollabJoin(handler: GenericHandler): () => void {
    this.collabJoinHandlers.add(handler);
    return () => this.collabJoinHandlers.delete(handler);
  }

  onCollabLeave(handler: GenericHandler): () => void {
    this.collabLeaveHandlers.add(handler);
    return () => this.collabLeaveHandlers.delete(handler);
  }

  onCollabState(handler: GenericHandler): () => void {
    this.collabStateHandlers.add(handler);
    return () => this.collabStateHandlers.delete(handler);
  }

  onCollabChat(handler: GenericHandler): () => void {
    this.collabChatHandlers.add(handler);
    return () => this.collabChatHandlers.delete(handler);
  }

  onCollabReaction(handler: GenericHandler): () => void {
    this.collabReactionHandlers.add(handler);
    return () => this.collabReactionHandlers.delete(handler);
  }

  /** Join a collab room channel */
  joinCollabRoom(roomId: string): void {
    this.send('collab:join_room', { roomId });
  }

  /** Leave a collab room channel */
  leaveCollabRoom(roomId: string): void {
    this.send('collab:leave_room', { roomId });
  }

  /** Send chat message in collab room */
  sendCollabChat(roomId: string, message: string): void {
    this.send('collab:chat', { roomId, message });
  }

  /** Send reaction in collab room */
  sendCollabReaction(roomId: string, emoji: string): void {
    this.send('collab:reaction', { roomId, emoji });
  }

  /** Update collab participant state (muted, camera on/off) */
  updateCollabState(roomId: string, state: Record<string, unknown>): void {
    this.send('collab:state', { roomId, ...state });
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }
}

export const websocketService = new WebSocketService();
