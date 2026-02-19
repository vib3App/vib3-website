'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'vib3_onboarding_complete';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: 'welcome' | 'record' | 'effects' | 'music' | 'share';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to VIB3',
    description: 'The next generation social video platform. Create, share, and discover amazing short-form videos.',
    icon: 'welcome',
  },
  {
    id: 'record',
    title: 'Record Videos',
    description: 'Capture moments with our powerful camera. Use timers, flip between front and back cameras, and record hands-free.',
    icon: 'record',
  },
  {
    id: 'effects',
    title: 'Add Effects',
    description: 'Make your videos stand out with AR filters, beauty mode, text overlays, and stickers.',
    icon: 'effects',
  },
  {
    id: 'music',
    title: 'Add Music',
    description: 'Browse thousands of sounds and songs. Sync your video to the perfect beat.',
    icon: 'music',
  },
  {
    id: 'share',
    title: 'Share & Discover',
    description: 'Share your creations with the world. Explore trending videos, follow creators, and join the community.',
    icon: 'share',
  },
];

export function useOnboarding() {
  const [isComplete, setIsComplete] = useState(true); // Default true to prevent flash
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsComplete(completed);
    if (!completed) {
      setIsOpen(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeOnboarding();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsComplete(true);
    setIsOpen(false);
  }, []);

  const skip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  return {
    isComplete,
    isOpen,
    currentStep,
    totalSteps: ONBOARDING_STEPS.length,
    step: ONBOARDING_STEPS[currentStep],
    nextStep,
    prevStep,
    skip,
    completeOnboarding,
  };
}
