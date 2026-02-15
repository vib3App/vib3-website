'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSmartShortcuts } from '@/hooks/useAdaptiveUI';

interface ShortcutItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

interface SmartShortcutsProps {
  shortcuts: ShortcutItem[];
  className?: string;
}

/**
 * AI-powered smart shortcuts that adapt based on usage patterns
 */
export function SmartShortcuts({ shortcuts, className = '' }: SmartShortcutsProps) {
  const { shortcuts: suggestedIds, isPowerUser } = useSmartShortcuts();

  // Filter and sort shortcuts based on AI suggestions
  const prioritizedShortcuts = shortcuts
    .map((s) => ({
      ...s,
      priority: suggestedIds.indexOf(s.id),
      isPower: isPowerUser(s.id),
    }))
    .sort((a, b) => {
      if (a.priority === -1 && b.priority === -1) return 0;
      if (a.priority === -1) return 1;
      if (b.priority === -1) return -1;
      return a.priority - b.priority;
    })
    .slice(0, 5);

  return (
    <motion.div
      className={`flex items-center gap-2 overflow-x-auto pb-2 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prioritizedShortcuts.map((shortcut, index) => (
        <motion.button
          key={shortcut.id}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full
            backdrop-blur-xl border whitespace-nowrap
            transition-colors duration-300
            ${shortcut.isPower
              ? 'bg-purple-500/30 border-purple-500/50 text-purple-300'
              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }
          `}
          onClick={shortcut.action}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-lg">{shortcut.icon}</span>
          <span className="text-sm font-medium">{shortcut.label}</span>
          {shortcut.isPower && (
            <motion.span
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}

/**
 * Floating action button that shows contextual quick actions
 */
export function ContextualFAB({ className = '' }: { className?: string }) {
  const { shortcuts: suggestedIds } = useSmartShortcuts();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions = [
    { id: 'create', icon: '🎬', label: 'Create' },
    { id: 'go-live', icon: '📺', label: 'Go Live' },
    { id: 'story', icon: '📸', label: 'Story' },
    { id: 'duet', icon: '👯', label: 'Duet' },
  ];

  const prioritized = quickActions
    .filter((a) => suggestedIds.includes(a.id) || suggestedIds.length === 0)
    .slice(0, 4);

  return (
    <div className={`fixed bottom-24 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-16 right-0 flex flex-col gap-2"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
          >
            {prioritized.map((action, index) => (
              <motion.button
                key={action.id}
                className="flex items-center gap-2 px-4 py-2 rounded-full
                         bg-white/10 backdrop-blur-xl border border-white/20
                         text-white shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, x: -5 }}
              >
                <span>{action.icon}</span>
                <span className="text-sm">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500
                   flex items-center justify-center text-white text-2xl
                   shadow-lg shadow-purple-500/30"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isExpanded ? 45 : 0 }}
      >
        +
      </motion.button>
    </div>
  );
}

export default SmartShortcuts;
