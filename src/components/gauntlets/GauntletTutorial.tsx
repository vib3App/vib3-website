'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const TUTORIAL_FLAG = 'vib3_gauntlet_tutorial_seen';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const STEPS: TutorialStep[] = [
  {
    title: 'Join a Gauntlet',
    description: 'Browse active gauntlets and tap "Join" to enter the competition. Each gauntlet has a theme, category, and limited spots.',
    icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
  },
  {
    title: 'Submit Your Video',
    description: 'When it is your turn, record or upload a video that matches the gauntlet theme. Your best content wins votes!',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
  {
    title: 'Vote on Matches',
    description: 'Watch head-to-head matchups and vote for your favorite. Every vote counts toward deciding the winner of each round.',
    icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
  },
  {
    title: 'Bracket Elimination',
    description: 'Gauntlets use a bracket tournament format. Winners advance to the next round, losers are eliminated. Last one standing is the champion!',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    title: 'Win the Crown',
    description: 'The gauntlet champion earns a gold badge displayed on their profile. Compete in multiple gauntlets to build your collection!',
    icon: 'M5 3l3.5 3L12 2l3.5 4L19 3v13H5V3zM5 19h14a2 2 0 010 4H5a2 2 0 010-4z',
  },
];

interface GauntletTutorialProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function GauntletTutorial({ forceShow = false, onClose }: GauntletTutorialProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    try {
      const seen = localStorage.getItem(TUTORIAL_FLAG);
      if (!seen) setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, [forceShow]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    try { localStorage.setItem(TUTORIAL_FLAG, 'true'); } catch {}
    onClose?.();
  }, [onClose]);

  const goNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleClose();
    }
  }, [currentStep, handleClose]);

  const goPrev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md glass-card rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h3 className="text-white font-semibold">How Gauntlets Work</h3>
          <button onClick={handleClose} className="p-1 hover:bg-white/10 rounded-full transition">
            <XMarkIcon className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-teal-500/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
            </svg>
          </div>

          {/* Step info */}
          <h4 className="text-white text-xl font-bold mb-3">{step.title}</h4>
          <p className="text-white/60 text-sm leading-relaxed mb-6">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'w-6 bg-purple-500'
                    : i < currentStep
                      ? 'bg-purple-500/50'
                      : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 px-4 py-2 text-white/40 hover:text-white/70 text-sm transition disabled:opacity-0"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={goNext}
              className="flex items-center gap-1 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-medium text-sm rounded-full hover:opacity-90 transition"
            >
              {isLast ? 'Got it!' : 'Next'}
              {!isLast && <ChevronRightIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
