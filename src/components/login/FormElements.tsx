'use client';

import type { AuthMode } from '@/hooks/useLoginForm';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}

export function FormInput({ label, type, value, placeholder, error, onChange }: FormInputProps) {
  return (
    <div>
      <label className="block text-white/70 text-sm mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
          error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

interface PasswordInputProps {
  label: string;
  value: string;
  placeholder: string;
  showPassword: boolean;
  error?: string;
  showForgot?: boolean;
  showHint?: boolean;
  onChange: (value: string) => void;
  onToggleShow: () => void;
  onForgotClick?: () => void;
}

export function PasswordInput({
  label,
  value,
  placeholder,
  showPassword,
  error,
  showForgot,
  showHint,
  onChange,
  onToggleShow,
  onForgotClick,
}: PasswordInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-white/70 text-sm">{label}</label>
        {showForgot && (
          <button type="button" onClick={onForgotClick} className="text-[#6366F1] text-sm hover:underline">
            Forgot password?
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 pr-12 text-white placeholder-white/30 focus:outline-none transition-colors ${
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {showHint && <p className="text-white/30 text-xs mt-1">8+ characters, uppercase, lowercase, number</p>}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

interface SubmitButtonProps {
  mode: AuthMode;
  isSubmitting: boolean;
}

export function SubmitButton({ mode, isSubmitting }: SubmitButtonProps) {
  const labels: Record<AuthMode, string> = {
    login: 'Sign In',
    register: 'Create Account',
    forgot: 'Send Reset Link',
  };

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-gradient-to-r from-[#6366F1] to-[#14B8A6] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </span>
      ) : labels[mode]}
    </button>
  );
}

interface FormMessageProps {
  type: 'error' | 'success';
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
  const styles = type === 'error'
    ? 'bg-red-500/10 border-red-500/20 text-red-400'
    : 'bg-green-500/10 border-green-500/20 text-green-400';

  return <div className={`border rounded-lg p-3 text-sm ${styles}`}>{message}</div>;
}
