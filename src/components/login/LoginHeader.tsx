'use client';

import Link from 'next/link';
import Image from 'next/image';

export function LoginHeader() {
  return (
    <Link href="/" className="flex items-center justify-center mb-8 group">
      <div className="relative w-24 h-24 group-hover:scale-105 transition-transform">
        <Image
          src="/vib3-logo.png"
          alt="VIB3"
          fill
          className="object-contain"
          style={{
            filter: 'drop-shadow(0 0 16px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 32px rgba(34, 211, 238, 0.2))'
          }}
          priority
        />
      </div>
    </Link>
  );
}
