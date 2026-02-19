/**
 * Gap #82: WebSocket Collab Room extensions
 * Extracted from websocket.ts to keep files under 300 lines.
 * Provides collab-specific event subscriptions and emitters.
 */
import { websocketService } from './websocket';

/**
 * Join a collab room WebSocket channel.
 * Emits `collab:join_room` to the server.
 */
export function joinCollabRoom(roomId: string): void {
  websocketService.joinCollabRoom(roomId);
}

/**
 * Leave a collab room WebSocket channel.
 */
export function leaveCollabRoom(roomId: string): void {
  websocketService.leaveCollabRoom(roomId);
}

/**
 * Send a chat message within a collab room.
 */
export function sendCollabChat(roomId: string, message: string): void {
  websocketService.sendCollabChat(roomId, message);
}

/**
 * Send a reaction emoji in a collab room.
 */
export function sendCollabReaction(roomId: string, emoji: string): void {
  websocketService.sendCollabReaction(roomId, emoji);
}

/**
 * Update own participant state (muted, camera on/off) in a collab room.
 */
export function updateCollabState(roomId: string, state: Record<string, unknown>): void {
  websocketService.updateCollabState(roomId, state);
}
