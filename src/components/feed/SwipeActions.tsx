'use client';

import { useRef, useCallback, useState } from 'react';

interface SwipeActionsProps {
  onNotInterested?: () => void;
  onReport?: () => void;
  onHideCreator?: () => void;
  onSwipeRight?: () => void;
  rightLabel?: string;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 100;

/**
 * SwipeActions - Wraps a feed video item to detect swipe gestures.
 * Swipe left reveals an action tray with Not Interested, Report, Hide Creator.
 * Swipe right fires onSwipeRight callback.
 */
export function SwipeActions({
  onNotInterested,
  onReport,
  onHideCreator,
  onSwipeRight,
  rightLabel = 'Add to Collection',
  children,
}: SwipeActionsProps) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [showActionTray, setShowActionTray] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Don't start swiping if the touch is on action buttons or interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-swipe], button, a, [role="button"]')) return;

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping) return;
      const dx = e.touches[0].clientX - touchStartX.current;
      const dy = e.touches[0].clientY - touchStartY.current;

      // Only track horizontal swipes
      if (Math.abs(dy) > Math.abs(dx) * 1.5) {
        setSwiping(false);
        setSwipeOffset(0);
        return;
      }

      const resistance = 0.4;
      setSwipeOffset(dx * resistance);
    },
    [swiping]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swiping) return;
    setSwiping(false);

    if (swipeOffset < -SWIPE_THRESHOLD * 0.4) {
      setShowActionTray(true);
    } else if (swipeOffset > SWIPE_THRESHOLD * 0.4 && onSwipeRight) {
      onSwipeRight();
    }

    setSwipeOffset(0);
  }, [swiping, swipeOffset, onSwipeRight]);

  // Mouse support for desktop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Don't start swiping if the click is on action buttons or interactive controls
      const target = e.target as HTMLElement;
      if (target.closest('[data-no-swipe], button, a, [role="button"]')) return;

      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
      setSwiping(true);

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - touchStartX.current;
        const dy = ev.clientY - touchStartY.current;
        if (Math.abs(dy) > Math.abs(dx) * 1.5) return;
        setSwipeOffset(dx * 0.4);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        setSwiping(false);
        setSwipeOffset((prev) => {
          if (prev < -SWIPE_THRESHOLD * 0.4) {
            setShowActionTray(true);
          } else if (prev > SWIPE_THRESHOLD * 0.4 && onSwipeRight) {
            onSwipeRight();
          }
          return 0;
        });
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onSwipeRight]
  );

  const leftProgress = Math.min(
    Math.abs(Math.min(swipeOffset, 0)) / (SWIPE_THRESHOLD * 0.4),
    1
  );
  const rightProgress = Math.min(
    Math.max(swipeOffset, 0) / (SWIPE_THRESHOLD * 0.4),
    1
  );

  const closeActionTray = useCallback(() => {
    setShowActionTray(false);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* Swipe left indicator */}
      {leftProgress > 0 && !showActionTray && (
        <div
          className="absolute right-0 top-0 bottom-0 z-40 flex items-center justify-center pointer-events-none"
          style={{
            width: `${Math.max(leftProgress * 120, 40)}px`,
            opacity: leftProgress,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                leftProgress >= 1 ? 'bg-red-500' : 'bg-red-500/50'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-white text-[10px] font-medium whitespace-nowrap">
              Actions
            </span>
          </div>
        </div>
      )}

      {/* Swipe right indicator */}
      {rightProgress > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 z-40 flex items-center justify-center pointer-events-none"
          style={{
            width: `${Math.max(rightProgress * 120, 40)}px`,
            opacity: rightProgress,
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                rightProgress >= 1 ? 'bg-teal-500' : 'bg-teal-500/50'
              }`}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-white text-[10px] font-medium whitespace-nowrap">
              {rightLabel}
            </span>
          </div>
        </div>
      )}

      {/* Content with swipe transform */}
      <div
        className="w-full h-full"
        style={{
          transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined,
          transition: swiping ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {children}
      </div>

      {/* Action tray overlay */}
      {showActionTray && (
        <SwipeActionTray
          onNotInterested={() => {
            onNotInterested?.();
            closeActionTray();
          }}
          onReport={() => {
            onReport?.();
            closeActionTray();
          }}
          onHideCreator={() => {
            onHideCreator?.();
            closeActionTray();
          }}
          onClose={closeActionTray}
        />
      )}
    </div>
  );
}

function SwipeActionTray({ onNotInterested, onReport, onHideCreator, onClose }: {
  onNotInterested: () => void; onReport: () => void; onHideCreator: () => void; onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div
        className="absolute right-0 top-0 bottom-0 w-64 z-50 glass-card border-l border-white/10 flex flex-col justify-center px-4 gap-3"
        style={{ animation: 'slide-in-right 0.25s ease-out' }}
      >
        <ActionTrayButton
          icon={<TrayIcon d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242M21 21l-4.878-4.878" />}
          label="Not Interested"
          desc="See fewer like this"
          onClick={onNotInterested}
          color="text-amber-400"
        />
        <ActionTrayButton
          icon={<TrayIcon d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />}
          label="Report"
          desc="Report this video"
          onClick={onReport}
          color="text-red-400"
        />
        <ActionTrayButton
          icon={<TrayIcon d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
          label="Hide Creator"
          desc="Stop seeing this creator"
          onClick={onHideCreator}
          color="text-orange-400"
        />

        <button
          onClick={onClose}
          className="mt-2 w-full py-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>

      <style jsx global>{`
        @keyframes slide-in-right { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </>
  );
}

function ActionTrayButton({ icon, label, desc, onClick, color }: {
  icon: React.ReactNode; label: string; desc: string; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left">
      <div className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-white/40 text-xs">{desc}</p>
      </div>
    </button>
  );
}

const TrayIcon = ({ d }: { d: string }) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);
