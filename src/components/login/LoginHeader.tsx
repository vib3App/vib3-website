'use client';

import Link from 'next/link';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';

export function LoginHeader() {
  return (
    <Link href="/" className="flex items-center justify-center mb-8 group">
      <div className="group-hover:scale-105 transition-transform">
        <AnimatedLogo size={200} loop={true} autoPlay={true} />
      </div>
    </Link>
  );
}
