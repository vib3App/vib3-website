'use client';

import { useToastStore } from '@/stores/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

const typeStyles = {
  error: 'bg-red-500/90 border-red-400/50',
  success: 'bg-green-500/90 border-green-400/50',
  info: 'bg-blue-500/90 border-blue-400/50',
};

const typeIcons = {
  error: '!',
  success: '\u2713',
  info: 'i',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm text-white text-sm shadow-lg ${typeStyles[toast.type]}`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {typeIcons[toast.type]}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white text-lg leading-none flex-shrink-0"
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
