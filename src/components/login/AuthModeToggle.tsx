'use client';

import type { AuthMode } from '@/hooks/useLoginForm';

interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex glass rounded-xl p-1 mb-6">
      <button
        onClick={() => onModeChange('login')}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
          mode === 'login' ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white' : 'text-white/50 hover:text-white'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => onModeChange('register')}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
          mode === 'register' ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white' : 'text-white/50 hover:text-white'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
