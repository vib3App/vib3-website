'use client';

import { useEffect, useRef } from 'react';
import { useActionButtonStore } from '@/stores/actionButtonStore';
import type { LayoutType, ButtonSize } from '@/types/actionButtons';
import { LAYOUT_INFO, SIZE_INFO } from '@/types/actionButtons';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export function SettingsPopover({ isOpen, onClose, isMobile }: SettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const {
    preferences,
    mobilePreferences,
    setLayout,
    setSize,
    toggleButton,
    resetToDefault,
  } = useActionButtonStore();

  const currentPrefs = isMobile ? mobilePreferences : preferences;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const layouts: LayoutType[] = ['horizontal', 'vertical', 'floating', 'arc', 'corner'];
  const sizes: ButtonSize[] = ['small', 'medium', 'large'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={popoverRef}
        className="bg-neutral-900 rounded-2xl p-4 w-[320px] max-h-[80vh] overflow-y-auto shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Customize Buttons</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition text-white/60"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Layout Selection */}
        <div className="mb-4">
          <label className="text-white/60 text-sm mb-2 block">Layout</label>
          <div className="grid grid-cols-2 gap-2">
            {layouts.map((layout) => (
              <button
                key={layout}
                onClick={() => setLayout(layout, isMobile)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  currentPrefs.layout === layout
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <LayoutIcon layout={layout} />
                  <span className="text-sm font-medium">{LAYOUT_INFO[layout].name}</span>
                </div>
                <p className="text-xs text-white/50">{LAYOUT_INFO[layout].description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-4">
          <label className="text-white/60 text-sm mb-2 block">Button Size</label>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSize(size, isMobile)}
                className={`flex-1 py-2 px-3 rounded-lg border transition-all ${
                  currentPrefs.size === size
                    ? 'border-amber-500 bg-amber-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="text-sm font-medium">{SIZE_INFO[size].name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Button Visibility */}
        <div className="mb-4">
          <label className="text-white/60 text-sm mb-2 block">Show/Hide Buttons</label>
          <div className="space-y-2">
            {currentPrefs.buttons.map((btn) => (
              <label
                key={btn.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                <span className="text-white text-sm capitalize">{btn.id}</span>
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    btn.visible ? 'bg-amber-500' : 'bg-white/20'
                  }`}
                  onClick={() => toggleButton(btn.id, isMobile)}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      btn.visible ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Drag Instructions */}
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-200 text-sm">
            <strong>Tip:</strong> Long press (hold) the action bar for 0.5s to drag it to a new position.
          </p>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            resetToDefault(isMobile);
            onClose();
          }}
          className="w-full py-2 px-4 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 transition text-sm"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}

function LayoutIcon({ layout }: { layout: LayoutType }) {
  const iconClass = "w-4 h-4";

  switch (layout) {
    case 'horizontal':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="10" width="4" height="4" rx="1" />
          <rect x="7" y="10" width="4" height="4" rx="1" />
          <rect x="12" y="10" width="4" height="4" rx="1" />
          <rect x="17" y="10" width="4" height="4" rx="1" />
        </svg>
      );
    case 'vertical':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <rect x="10" y="2" width="4" height="4" rx="1" />
          <rect x="10" y="7" width="4" height="4" rx="1" />
          <rect x="10" y="12" width="4" height="4" rx="1" />
          <rect x="10" y="17" width="4" height="4" rx="1" />
        </svg>
      );
    case 'floating':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="8" r="2.5" />
          <circle cx="8" cy="16" r="2.5" />
          <circle cx="16" cy="18" r="2.5" />
        </svg>
      );
    case 'arc':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="18" r="2.5" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="4" cy="8" r="2" />
          <circle cx="18" cy="14" r="2" />
          <circle cx="20" cy="8" r="2" />
        </svg>
      );
    case 'corner':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <rect x="14" y="14" width="8" height="8" rx="2" />
          <rect x="14" y="4" width="3" height="3" rx="0.5" opacity="0.5" />
          <rect x="19" y="4" width="3" height="3" rx="0.5" opacity="0.5" />
          <rect x="14" y="9" width="3" height="3" rx="0.5" opacity="0.5" />
          <rect x="19" y="9" width="3" height="3" rx="0.5" opacity="0.5" />
        </svg>
      );
    default:
      return null;
  }
}
