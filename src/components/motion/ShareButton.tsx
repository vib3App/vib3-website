'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';

interface ShareOption {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

const defaultOptions: ShareOption[] = [
  {
    id: 'copy',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
      </svg>
    ),
    label: 'Copy Link',
    color: '#8B5CF6',
  },
  {
    id: 'twitter',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: 'Twitter',
    color: '#1DA1F2',
  },
  {
    id: 'facebook',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    label: 'Facebook',
    color: '#1877F2',
  },
  {
    id: 'message',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: 'Message',
    color: '#14B8A6',
  },
];

/**
 * Share button with options that fan out in an arc
 */
export function ShareButton({
  options = defaultOptions,
  onShare,
}: {
  options?: ShareOption[];
  onShare?: (optionId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = useCallback((optionId: string) => {
    onShare?.(optionId);
    setIsOpen(false);
  }, [onShare]);

  return (
    <div className="relative">
      {/* Share options arc */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Options */}
            {options.map((option, index) => {
              const angle = -90 + (index / (options.length - 1)) * 180;
              const radians = (angle * Math.PI) / 180;
              const distance = 70;
              const x = Math.cos(radians) * distance;
              const y = Math.sin(radians) * distance;

              return (
                <motion.button
                  key={option.id}
                  className="absolute z-20 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: option.color }}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x,
                    y: y - 20,
                  }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                  onClick={() => handleOptionClick(option.id)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {option.icon}
                </motion.button>
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Main share button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-30 p-3 rounded-full glass text-white/60 hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </motion.button>
    </div>
  );
}

export default ShareButton;
