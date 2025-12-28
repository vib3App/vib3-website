'use client';

import Script from 'next/script';
import { useLoginForm } from '@/hooks/useLoginForm';
import { LoginHeader, AuthModeToggle, LoginForm, OAuthButtons } from '@/components/login';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, config: { theme: string; size: string; width: number }) => void;
          prompt: () => void;
        };
      };
    };
    AppleID?: {
      auth: {
        init: (config: { clientId: string; scope: string; redirectURI: string; usePopup: boolean }) => void;
        signIn: () => Promise<{ authorization: { id_token: string; code: string }; user?: { name?: { firstName?: string; lastName?: string } } }>;
      };
    };
  }
}

export default function LoginPage() {
  const form = useLoginForm();

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" onLoad={() => form.setGoogleLoaded(true)} />
      <Script src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js" />

      <div className="min-h-screen aurora-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <LoginHeader />

          <div className="glass-heavy rounded-3xl p-8 border border-white/10">
            {form.mode === 'forgot' ? (
              <>
                <h1 className="text-2xl font-bold text-white text-center mb-2">Reset Password</h1>
                <p className="text-white/50 text-center mb-6">Enter your email to receive a reset link</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white text-center mb-2">
                  {form.mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-white/50 text-center mb-6">
                  {form.mode === 'login' ? 'Sign in to continue' : 'Join the VIB3 community'}
                </p>
              </>
            )}

            {form.mode !== 'forgot' && (
              <AuthModeToggle mode={form.mode} onModeChange={form.changeMode} />
            )}

            <LoginForm
              mode={form.mode}
              email={form.email}
              password={form.password}
              confirmPassword={form.confirmPassword}
              username={form.username}
              birthdate={form.birthdate}
              maxBirthdate={form.maxBirthdate}
              showPassword={form.showPassword}
              fieldErrors={form.fieldErrors}
              error={form.error}
              success={form.success}
              isSubmitting={form.isSubmitting}
              onEmailChange={form.setEmail}
              onPasswordChange={form.setPassword}
              onConfirmPasswordChange={form.setConfirmPassword}
              onUsernameChange={form.setUsername}
              onBirthdateChange={form.setBirthdate}
              onShowPasswordToggle={() => form.setShowPassword(!form.showPassword)}
              onClearFieldError={form.clearFieldError}
              onModeChange={form.changeMode}
              onSubmit={form.handleSubmit}
            />

            {form.mode !== 'forgot' && (
              <OAuthButtons
                isSubmitting={form.isSubmitting}
                googleLoaded={form.googleLoaded}
                onGoogleClick={form.promptGoogleSignIn}
                onAppleClick={form.handleAppleSignIn}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
