'use client';

interface Requirement {
  id: string;
  label: string;
  met: boolean;
  currentDisplay: string;
}

interface EligibilityRequirementsProps {
  requirements: Requirement[];
  isEligible: boolean;
}

export function EligibilityRequirements({ requirements, isEligible }: EligibilityRequirementsProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Eligibility Requirements</h2>
      <div className="glass-card overflow-hidden">
        {requirements.map((req, index) => (
          <div
            key={req.id}
            className={`flex items-center justify-between p-4 ${
              index < requirements.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  req.met ? 'bg-green-500' : 'bg-white/10'
                }`}
              >
                {req.met ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <span className="text-white/80">{req.label}</span>
            </div>
            <span className={req.met ? 'text-green-500' : 'text-white/50'}>{req.currentDisplay}</span>
          </div>
        ))}
      </div>
      {!isEligible && (
        <p className="text-white/50 text-sm mt-4 text-center">
          Complete all requirements to apply for the Creator Fund
        </p>
      )}
    </section>
  );
}
