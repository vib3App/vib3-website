'use client';

import { useState } from 'react';
import { apiClient } from '@/services/api';

interface ParentalConsentModalProps {
  isOpen: boolean;
  userAge: number;
  userId: string;
  username: string;
  onComplete: () => void;
  onSkip: () => void;
}

const RESTRICTIONS = [
  'Direct messaging is disabled',
  'Location features are disabled',
  'AI personalization is limited',
  'Your profile is private by default',
];

export function ParentalConsentModal({
  isOpen,
  userAge,
  userId,
  username,
  onComplete,
  onSkip,
}: ParentalConsentModalProps) {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [consentSent, setConsentSent] = useState(false);

  if (!isOpen) return null;

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!parentName.trim()) {
      setError('Please enter parent/guardian name.');
      return;
    }
    if (!isValidEmail(parentEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/parental-consent/request', {
        parentEmail: parentEmail.trim(),
        parentName: parentName.trim(),
        minorUserId: userId,
        minorUsername: username,
        minorAge: userAge,
      });
      setConsentSent(true);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to send consent request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (consentSent) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md mx-4 glass-heavy rounded-3xl border border-white/10 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Consent Request Sent!</h2>
            <p className="text-white/60 mb-2">We&apos;ve sent an email to:</p>
            <p className="text-purple-400 font-semibold mb-6">{parentEmail}</p>

            <div className="glass rounded-xl p-4 mb-6 text-left">
              <p className="text-white/60 text-sm leading-relaxed">
                Ask your parent/guardian to check their email and click the verification link.
                Once they approve, you&apos;ll have access to all features!
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity mb-3"
            >
              Continue to VIB3
            </button>

            <button
              onClick={() => setConsentSent(false)}
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              Send to a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md mx-4 glass-heavy rounded-3xl border border-white/10 p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Parental Consent Required</h2>
          <p className="text-white/60 text-sm">
            Since you&apos;re {userAge} years old, we need your parent or guardian&apos;s consent
            to use some features of VIB3.
          </p>
          <p className="text-white/40 text-xs mt-1">
            Required by the Children&apos;s Online Privacy Protection Act (COPPA).
          </p>
        </div>

        {/* Restrictions box */}
        <div className="glass rounded-xl p-4 mb-6 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm font-semibold">Without parental consent:</span>
          </div>
          {RESTRICTIONS.map((item) => (
            <div key={item} className="flex items-center gap-2 py-1">
              <span className="text-white/30 text-xs">-</span>
              <span className="text-white/60 text-sm">{item}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">
              Parent/Guardian Name
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Enter their full name"
              className="w-full glass text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-1.5">
              Parent/Guardian Email
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              placeholder="Enter their email address"
              className="w-full glass text-white px-4 py-3 rounded-xl outline-none placeholder:text-white/30 focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              'Send Consent Request'
            )}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full text-white/40 hover:text-white text-sm transition-colors py-2"
          >
            Skip for now (limited features)
          </button>
        </form>

        <p className="text-white/30 text-xs text-center mt-4">
          We will only use this email to send a consent request.
          We do not sell or share parent contact information.
        </p>
      </div>
    </div>
  );
}
