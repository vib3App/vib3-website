'use client';

import { useState, useCallback } from 'react';

type CallPermission = 'everyone' | 'followers' | 'mutual' | 'nobody';

interface CallPermissionsProps {
  currentPermission: CallPermission;
  onPermissionChange: (permission: CallPermission) => void;
  blockedUsers: { id: string; username: string }[];
  onUnblockUser: (userId: string) => void;
}

const PERMISSION_OPTIONS: { value: CallPermission; label: string; description: string; icon: string }[] = [
  { value: 'everyone', label: 'Everyone', description: 'Anyone can call you', icon: '🌍' },
  { value: 'followers', label: 'Followers', description: 'Only people who follow you', icon: '👥' },
  { value: 'mutual', label: 'Mutual Follows', description: 'Only people you both follow', icon: '🤝' },
  { value: 'nobody', label: 'Nobody', description: 'Disable incoming calls', icon: '🚫' },
];

export function CallPermissions({ currentPermission, onPermissionChange, blockedUsers, onUnblockUser }: CallPermissionsProps) {
  const [showBlocked, setShowBlocked] = useState(false);

  const handleChange = useCallback((perm: CallPermission) => {
    onPermissionChange(perm);
  }, [onPermissionChange]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white font-medium mb-3">Who can call you</h3>
        <div className="space-y-2">
          {PERMISSION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                currentPermission === opt.value
                  ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30'
                  : 'glass hover:bg-white/5'
              }`}
            >
              <span className="text-xl">{opt.icon}</span>
              <div className="text-left flex-1">
                <div className="text-white text-sm font-medium">{opt.label}</div>
                <div className="text-white/40 text-xs">{opt.description}</div>
              </div>
              {currentPermission === opt.value && (
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Blocked callers */}
      <div>
        <button
          onClick={() => setShowBlocked(!showBlocked)}
          className="flex items-center justify-between w-full text-white/60 text-sm hover:text-white"
        >
          <span>Blocked callers ({blockedUsers.length})</span>
          <svg className={`w-4 h-4 transition-transform ${showBlocked ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showBlocked && blockedUsers.length > 0 && (
          <div className="mt-2 space-y-1">
            {blockedUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-2 glass rounded-lg">
                <span className="text-white text-sm">@{u.username}</span>
                <button onClick={() => onUnblockUser(u.id)} className="text-teal-400 text-xs hover:text-teal-300">
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
