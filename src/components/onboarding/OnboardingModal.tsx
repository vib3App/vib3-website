'use client';

import React from 'react';
import { useOnboarding, type OnboardingStep } from '@/hooks/useOnboarding';

function StepIcon({ icon }: { icon: OnboardingStep['icon'] }) {
  const iconMap: Record<OnboardingStep['icon'], React.JSX.Element> = {
    welcome: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    record: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    effects: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    music: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    share: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  };

  return (
    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/30 to-teal-400/30 flex items-center justify-center text-white mx-auto">
      {iconMap[icon]}
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-8 bg-gradient-to-r from-purple-500 to-teal-400'
              : i < current
              ? 'w-2 bg-purple-500/50'
              : 'w-2 bg-white/20'
          }`}
        />
      ))}
    </div>
  );
}

export function OnboardingModal() {
  const {
    isOpen,
    currentStep,
    totalSteps,
    step,
    nextStep,
    prevStep,
    skip,
  } = useOnboarding();

  if (!isOpen || !step) return null;

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 glass-heavy rounded-3xl border border-white/10 p-8">
        {/* Skip button */}
        <button
          onClick={skip}
          className="absolute top-4 right-4 text-white/40 hover:text-white text-sm transition-colors"
        >
          Skip
        </button>

        {/* Step content */}
        <div className="text-center mt-4">
          <StepIcon icon={step.icon} />

          <h2 className="text-2xl font-bold text-white mt-6 mb-3">
            {step.title}
          </h2>

          <p className="text-white/60 leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Progress dots */}
          <ProgressDots current={currentStep} total={totalSteps} />

          {/* Navigation buttons */}
          <div className="flex items-center gap-3 mt-8">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors font-medium"
              >
                Back
              </button>
            )}

            <button
              onClick={nextStep}
              className={`flex-1 py-3 rounded-xl font-medium transition-opacity hover:opacity-90 ${
                isLastStep
                  ? 'bg-gradient-to-r from-purple-500 to-teal-400 text-white'
                  : 'bg-purple-500 text-white'
              }`}
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
