/**
 * Video Call Types
 */

export type CallStatus = 'ringing' | 'connecting' | 'active' | 'ended' | 'declined' | 'missed' | 'failed';
export type CallType = 'video' | 'audio';

export interface Call {
  id: string;
  type: CallType;
  callerId: string;
  callerUsername: string;
  callerAvatar?: string;
  receiverId: string;
  receiverUsername: string;
  receiverAvatar?: string;
  conversationId?: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number; // seconds
  createdAt: string;
}

export interface CallParticipant {
  userId: string;
  username: string;
  avatar?: string;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeaking: boolean;
}

export interface StartCallInput {
  receiverId: string;
  type: CallType;
  conversationId?: string;
}

export interface StartCallResponse {
  call: Call;
  liveKit: {
    url: string;
    token: string;
    roomName: string;
  };
}

export interface AnswerCallResponse {
  call: Call;
  liveKit: {
    url: string;
    token: string;
    roomName: string;
  };
}

export interface IncomingCall {
  callId: string;
  type: CallType;
  callerId: string;
  callerUsername: string;
  callerAvatar?: string;
  conversationId?: string;
}

export interface CallEndedEvent {
  callId: string;
  reason: 'declined' | 'ended' | 'missed' | 'failed' | 'busy';
  duration?: number;
}
