'use client';

import { useConfirmStore } from '@/stores/confirmStore';
import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmDialog() {
  const { isOpen, options, close } = useConfirmStore();

  if (!options) return null;

  const isDanger = options.variant === 'danger';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => close(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm rounded-2xl bg-gray-900 border border-white/10 p-6 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              {options.title}
            </h3>
            <p className="text-white/70 text-sm mb-6">
              {options.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => close(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => close(true)}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition ${
                  isDanger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
