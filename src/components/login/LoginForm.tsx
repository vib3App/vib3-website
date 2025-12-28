'use client';

import type { AuthMode } from '@/hooks/useLoginForm';
import { FormInput, PasswordInput, SubmitButton, FormMessage } from './FormElements';

interface LoginFormProps {
  mode: AuthMode;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  birthdate: string;
  maxBirthdate: string;
  showPassword: boolean;
  fieldErrors: Record<string, string>;
  error: string;
  success: string;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onBirthdateChange: (value: string) => void;
  onShowPasswordToggle: () => void;
  onClearFieldError: (field: string) => void;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function LoginForm({
  mode,
  email,
  password,
  confirmPassword,
  username,
  birthdate,
  maxBirthdate,
  showPassword,
  fieldErrors,
  error,
  success,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onUsernameChange,
  onBirthdateChange,
  onShowPasswordToggle,
  onClearFieldError,
  onModeChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === 'register' && (
        <FormInput
          label="Username"
          type="text"
          value={username}
          placeholder="Choose a username"
          error={fieldErrors.username}
          onChange={(v) => { onUsernameChange(v); onClearFieldError('username'); }}
        />
      )}

      <FormInput
        label="Email"
        type="email"
        value={email}
        placeholder="Enter your email"
        error={fieldErrors.email}
        onChange={(v) => { onEmailChange(v); onClearFieldError('email'); }}
      />

      {mode === 'register' && (
        <div>
          <label className="block text-white/70 text-sm mb-2">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => { onBirthdateChange(e.target.value); onClearFieldError('birthdate'); }}
            max={maxBirthdate}
            className={`w-full bg-[#0A0E1A] border rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-colors ${
              fieldErrors.birthdate ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#6366F1]'
            }`}
            style={{ colorScheme: 'dark' }}
          />
          {fieldErrors.birthdate && <p className="text-red-400 text-xs mt-1">{fieldErrors.birthdate}</p>}
          <p className="text-white/30 text-xs mt-1">You must be at least 13 years old</p>
        </div>
      )}

      {mode !== 'forgot' && (
        <PasswordInput
          label="Password"
          value={password}
          placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
          showPassword={showPassword}
          error={fieldErrors.password}
          showForgot={mode === 'login'}
          showHint={mode === 'register' && !fieldErrors.password}
          onChange={(v) => { onPasswordChange(v); onClearFieldError('password'); }}
          onToggleShow={onShowPasswordToggle}
          onForgotClick={() => onModeChange('forgot')}
        />
      )}

      {mode === 'register' && (
        <FormInput
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          placeholder="Confirm your password"
          error={fieldErrors.confirmPassword}
          onChange={(v) => { onConfirmPasswordChange(v); onClearFieldError('confirmPassword'); }}
        />
      )}

      {error && <FormMessage type="error" message={error} />}
      {success && <FormMessage type="success" message={success} />}

      <SubmitButton
        mode={mode}
        isSubmitting={isSubmitting}
      />

      {mode === 'forgot' && (
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className="w-full text-white/50 text-sm hover:text-white transition-colors"
        >
          Back to Sign In
        </button>
      )}
    </form>
  );
}
