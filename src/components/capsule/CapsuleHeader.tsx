'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export function CapsuleHeader() {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/capsule" className="p-2 hover:bg-white/10 rounded-full transition">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Create Time Capsule</h1>
        </div>
      </div>
    </header>
  );
}
