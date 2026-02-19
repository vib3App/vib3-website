'use client';

import { useState, useCallback } from 'react';
import { InterestSelector } from './InterestSelector';
import { FollowSuggestions } from './FollowSuggestions';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { apiClient } from '@/services/api/client';
import { logger } from '@/utils/logger';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const { selectedInterests, followedUsers, setInterests, setCompleted, addFollowedUser } = useOnboardingStore();

  const handleToggleInterest = useCallback((interest: string) => {
    const updated = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : [...selectedInterests, interest];
    setInterests(updated);
  }, [selectedInterests, setInterests]);

  const handleFollow = useCallback(async (userId: string) => {
    try {
      await apiClient.post(`/users/${userId}/follow`);
      addFollowedUser(userId);
    } catch (err) {
      logger.error('Failed to follow user:', err);
    }
  }, [addFollowedUser]);

  const handleFinish = () => {
    setCompleted();
    onComplete();
  };

  const steps = [
    {
      title: 'Welcome to VIB3!',
      subtitle: 'What are you into? Pick at least 3 interests so we can personalize your feed.',
      content: <InterestSelector selected={selectedInterests} onToggle={handleToggleInterest} />,
      canProceed: selectedInterests.length >= 3,
    },
    {
      title: 'Follow some creators',
      subtitle: 'Based on your interests, here are some creators you might enjoy.',
      content: <FollowSuggestions interests={selectedInterests} followedUsers={followedUsers} onFollow={handleFollow} />,
      canProceed: true,
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto px-4 py-12">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-purple-500 w-6' : i < step ? 'bg-purple-500' : 'bg-white/20'}`} />
          ))}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{current.title}</h1>
          <p className="text-white/50">{current.subtitle}</p>
        </div>

        <div className="mb-8">
          {current.content}
        </div>

        <div className="flex justify-center gap-4">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-8 py-3 glass text-white/70 rounded-xl hover:bg-white/10 transition"
            >
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!current.canProceed}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl"
            >
              Start Exploring
            </button>
          )}
        </div>

        {/* Skip */}
        <div className="text-center mt-4">
          <button onClick={handleFinish} className="text-white/30 text-sm hover:text-white/50 transition">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
