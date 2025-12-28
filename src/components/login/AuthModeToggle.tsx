'use client';

import type { AuthMode } from '@/hooks/useLoginForm';

interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex bg-[#0A0E1A] rounded-lg p-1 mb-6">
      <button
        onClick={() => onModeChange('login')}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'login' ? 'bg-[#6366F1] text-white' : 'text-white/50 hover:text-white'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => onModeChange('register')}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'register' ? 'bg-[#6366F1] text-white' : 'text-white/50 hover:text-white'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
