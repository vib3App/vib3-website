'use client';

import { motion, Variants, useInView, useAnimation } from 'framer-motion';
import { ReactNode, useEffect, useRef } from 'react';

// Stagger container for child animations
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Fade up animation
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Fade in animation
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

// Scale up animation
const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// Slide from left
const slideLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// Slide from right
const slideRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const variants = {
  staggerContainer,
  fadeUp,
  fadeIn,
  scaleUp,
  slideLeft,
  slideRight,
};

interface AnimatedProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Fade up on scroll into view
 */
export function FadeUp({ children, className = '', delay = 0 }: AnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('show');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={controls}
      className={className}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale up on scroll into view
 */
export function ScaleUp({ children, className = '', delay = 0 }: AnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('show');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={scaleUp}
      initial="hidden"
      animate={controls}
      className={className}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger children animations
 */
export function StaggerContainer({ children, className = '' }: Omit<AnimatedProps, 'delay'>) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('show');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item for stagger container
 */
export function StaggerItem({ children, className = '' }: Omit<AnimatedProps, 'delay'>) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Slide in from left on scroll
 */
export function SlideLeft({ children, className = '', delay = 0 }: AnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      variants={slideLeft}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide in from right on scroll
 */
export function SlideRight({ children, className = '', delay = 0 }: AnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      variants={slideRight}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export default FadeUp;
