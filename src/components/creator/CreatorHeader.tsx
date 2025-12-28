'use client';

import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export function CreatorHeader() {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-xl font-bold">Creator Studio</h1>
        <Link
          href="/upload"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-medium text-sm hover:opacity-90 transition"
        >
          <PlusIcon className="w-4 h-4" />
          Upload
        </Link>
      </div>
    </header>
  );
}
