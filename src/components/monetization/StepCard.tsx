'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface StepCardProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  isComplete?: boolean;
  children: React.ReactNode;
}

export function StepCard({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  isComplete,
  children,
}: StepCardProps) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">{title}</h3>
              {isComplete && <CheckCircleIcon className="w-5 h-5 text-green-400" />}
            </div>
            <p className="text-white/50 text-sm">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
