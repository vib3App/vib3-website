'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

interface Session {
  id: string;
  device: string;
  browser?: string;
  os?: string;
  location: string;
  ip?: string;
  lastActive: string;
  isCurrent: boolean;
}

/**
 * Gap #75: Active Sessions Management
 * List sessions, revoke individual/all sessions.
 */
export function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ sessions: Session[] }>('/auth/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      logger.error('Failed to load sessions:', err);
      // Fallback: show current session from JWT
      setSessions([getCurrentSessionFallback()]);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = useCallback(async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      addToast('Session revoked', 'success');
    } catch (err) {
      logger.error('Failed to revoke session:', err);
      addToast('Failed to revoke session', 'error');
    } finally {
      setRevoking(null);
    }
  }, [addToast]);

  const revokeAllOthers = useCallback(async () => {
    setRevoking('all');
    try {
      await apiClient.post('/auth/sessions/revoke-all');
      setSessions(prev => prev.filter(s => s.isCurrent));
      addToast('All other sessions revoked', 'success');
    } catch (err) {
      logger.error('Failed to revoke sessions:', err);
      addToast('Failed to revoke sessions', 'error');
    } finally {
      setRevoking(null);
    }
  }, [addToast]);

  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-medium">Active Sessions</h3>
          <p className="text-white/40 text-sm mt-0.5">Manage where you&apos;re signed in</p>
        </div>
        {otherSessions.length > 0 && (
          <button onClick={revokeAllOthers} disabled={revoking === 'all'}
            className="text-red-400 text-xs hover:text-red-300 px-3 py-1 glass rounded-full">
            {revoking === 'all' ? 'Revoking...' : 'Log out all others'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <DeviceIcon device={session.device} />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{session.device}</p>
                    {session.isCurrent && (
                      <span className="text-xs text-green-400 px-2 py-0.5 bg-green-400/10 rounded-full">Current</span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs">
                    {session.location}
                    {session.browser && ` - ${session.browser}`}
                    {' - '}
                    {formatLastActive(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.isCurrent && (
                <button onClick={() => revokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="text-red-400/60 hover:text-red-400 text-xs px-2 py-1 shrink-0">
                  {revoking === session.id ? '...' : 'Revoke'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeviceIcon({ device }: { device: string }) {
  const lower = device.toLowerCase();
  const isMobile = lower.includes('iphone') || lower.includes('android') || lower.includes('mobile');

  return (
    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
      {isMobile ? (
        <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  );
}

function formatLastActive(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function getCurrentSessionFallback(): Session {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  let device = 'Unknown Device';
  if (ua.includes('Chrome')) device = 'Chrome Browser';
  else if (ua.includes('Firefox')) device = 'Firefox Browser';
  else if (ua.includes('Safari')) device = 'Safari Browser';

  return {
    id: 'current',
    device,
    location: 'Current Location',
    lastActive: new Date().toISOString(),
    isCurrent: true,
  };
}
