'use client';

import { usePathname } from 'next/navigation';
import type { DropdownConfig } from './dropdownConfig';

interface DropdownProps {
  config: DropdownConfig;
  isOpen: boolean;
  onToggle: () => void;
}

export function Dropdown({ config, isOpen, onToggle }: DropdownProps) {
  const pathname = usePathname();
  const isActive = config.items.some(item => pathname === item.href || pathname.startsWith(item.href + '/'));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
          isActive || isOpen
            ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white border border-white/20'
            : 'glass text-white/70 hover:text-white hover:bg-white/10'
        }`}
      >
        <span>{config.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 min-w-[220px] glass-heavy rounded-2xl border border-white/10 shadow-xl overflow-hidden z-[100] animate-in">
          <div className="py-2">
            {config.items.map((item) => {
              const isItemActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block w-full px-4 py-3 transition-colors cursor-pointer ${
                    isItemActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-teal-500/20 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-white/40">{item.description}</div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
