'use client';

import type { AuthMode } from '@/hooks/useLoginForm';

interface AuthModeToggleProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex glass rounded-xl p-1.5 mb-6 border border-white/20">
      <button
        onClick={() => onModeChange('login')}
        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          mode === 'login'
            ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white shadow-lg'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => onModeChange('register')}
        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
          mode === 'register'
            ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white shadow-lg'
            : 'text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        Sign Up
      </button>
    </div>
  );
}
