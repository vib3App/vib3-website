'use client';

import Link from 'next/link';

export function LoginHeader() {
  return (
    <Link href="/" className="flex items-center justify-center gap-3 mb-8">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center font-bold text-2xl text-white">
        V
      </div>
      <span className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">
        VIB3
      </span>
    </Link>
  );
}
