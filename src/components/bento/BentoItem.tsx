'use client';

import { useState, useRef, ReactNode } from 'react';
import Link from 'next/link';

interface BentoItemProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'tall';
  href?: string;
  className?: string;
  onClick?: () => void;
}

const SIZES = {
  sm: 'bento-sm',
  md: 'bento-md',
  lg: 'bento-lg',
  xl: 'bento-xl',
  wide: 'bento-wide',
  tall: 'bento-tall',
};

export function BentoItem({ children, size = 'sm', href, className = '', onClick }: BentoItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * 10, y: -x * 10 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const content = (
    <div
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`bento-item glass-card p-0 cursor-pointer ${SIZES[size]} ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.15s ease-out',
      }}
    >
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
