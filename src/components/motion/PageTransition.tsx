'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
}

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.99,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

// Slide variants for different directions
export const slideVariants = {
  fromRight: {
    initial: { x: 100, opacity: 0 },
    enter: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { x: -100, opacity: 0, transition: { duration: 0.3 } },
  },
  fromLeft: {
    initial: { x: -100, opacity: 0 },
    enter: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { x: 100, opacity: 0, transition: { duration: 0.3 } },
  },
  fromBottom: {
    initial: { y: 100, opacity: 0 },
    enter: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { y: -50, opacity: 0, transition: { duration: 0.3 } },
  },
};

/**
 * Page transition wrapper with fade and slide effects
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Modal/overlay transition with scale effect
 */
export function ModalTransition({
  children,
  isOpen
}: {
  children: ReactNode;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PageTransition;
