/**
 * WebSocket Service for real-time communication
 * Uses Socket.IO client to match the backend's Socket.IO server
 */
import { io, Socket } from 'socket.io-client';
import type { Message, TypingIndicator } from '@/types';
import type { IncomingCall, CallEndedEvent } from '@/types/call';

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

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vib3app.net';

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
  private currentToken: string | null = null;

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
        query: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        this.notifyConnectionHandlers(true);
      });

      this.socket.on('disconnect', (_reason) => {
        this.notifyConnectionHandlers(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error.message);
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

      // Presence events
      this.socket.on('presence', (data: { userId: string; isOnline: boolean }) => {
        this.presenceHandlers.forEach((handler) => handler(data.userId, data.isOnline));
      });

      this.socket.on('user:status', (data: { userId: string; status: string }) => {
        this.presenceHandlers.forEach((handler) => handler(data.userId, data.status === 'online'));
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

    } catch (error) {
      console.error('Failed to create Socket.IO connection:', error);
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
   */
  send(type: string, payload: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(type, payload);
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean): void {
    this.send('typing', { conversationId, isTyping });
  }

  /**
   * Mark conversation as read
   */
  sendRead(conversationId: string, messageId: string): void {
    this.send('mark_read', { conversationId, messageId });
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

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => handler(connected));
  }
}

export const websocketService = new WebSocketService();
