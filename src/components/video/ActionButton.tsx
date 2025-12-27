'use client';

import { useState } from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  isActive?: boolean;
  label?: string | number;
  onClick: () => void;
  gradientFrom?: string;
  gradientTo?: string;
}

export function ActionButton({
  icon,
  activeIcon,
  isActive = false,
  label,
  onClick,
  gradientFrom = '#6366F1',
  gradientTo = '#14B8A6',
}: ActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const formatCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className="flex flex-col items-center gap-1 transition-transform duration-150"
      style={{ transform: isPressed ? 'scale(1.1)' : 'scale(1)' }}
    >
      <div
        className="w-[50px] h-[70px] rounded-[25px] flex flex-col items-center justify-center transition-all duration-200"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
          boxShadow: `
            0 0 12px ${gradientFrom}66,
            2px 2px 16px ${gradientTo}4D
          `,
        }}
      >
        <div className="text-white drop-shadow-md">
          {isActive && activeIcon ? activeIcon : icon}
        </div>
        {label !== undefined && (
          <span className="text-white text-[11px] font-bold mt-1 drop-shadow-md">
            {typeof label === 'number' ? formatCount(label) : label}
          </span>
        )}
      </div>
    </button>
  );
}
