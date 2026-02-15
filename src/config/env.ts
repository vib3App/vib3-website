/**
 * Environment configuration
 * Centralized config prevents scattered env access
 *
 * NEXT_PUBLIC_API_URL should be the API origin (e.g. https://api.vib3app.net).
 * config.api.baseUrl appends /api for REST endpoints.
 * config.api.socketUrl is the bare origin used for WebSocket / XHR connections.
 */
const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'https://api.vib3app.net';

export const config = {
  api: {
    /** REST API base URL (includes /api path) */
    baseUrl: `${API_ORIGIN}/api`,
    /** Origin URL for WebSocket and raw XHR requests (no /api suffix) */
    socketUrl: API_ORIGIN,
    timeout: 30000,
  },
  cdn: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://vib3-cdn.b-cdn.net',
  },
  app: {
    name: 'VIB3',
    version: '1.0.0',
  },
} as const;
