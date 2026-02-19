'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Espanol' },
  { code: 'fr', name: 'French', nativeName: 'Francais' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Portugues' },
  { code: 'ja', name: 'Japanese', nativeName: 'Japanese' },
  { code: 'ko', name: 'Korean', nativeName: 'Korean' },
  { code: 'zh', name: 'Chinese', nativeName: 'Chinese' },
  { code: 'ar', name: 'Arabic', nativeName: 'Arabic' },
  { code: 'hi', name: 'Hindi', nativeName: 'Hindi' },
  { code: 'ru', name: 'Russian', nativeName: 'Russian' },
  { code: 'tr', name: 'Turkish', nativeName: 'Turkce' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tieng Viet' },
  { code: 'th', name: 'Thai', nativeName: 'Thai' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

const STORAGE_KEY = 'vib3-language';

export default function LanguagePage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const [selected, setSelected] = useState('en');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSelected(stored);
  }, []);

  const handleSelect = (code: string) => {
    setSelected(code);
    localStorage.setItem(STORAGE_KEY, code);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const filtered = search
    ? LANGUAGES.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nativeName.toLowerCase().includes(search.toLowerCase())
      )
    : LANGUAGES;

  if (!isAuthVerified) return null;
  if (!isAuthenticated) { router.push('/login?redirect=/settings/language'); return null; }

  return (
    <div className="min-h-screen relative">
      <AuroraBackground intensity={20} />
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 relative z-10">
        <header className="sticky top-0 z-40 glass-heavy mx-4 rounded-2xl mb-4">
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={() => router.back()} className="text-white/50 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-white">Language</h1>
            {saved && <span className="text-green-400 text-sm ml-auto">Saved!</span>}
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages..."
            className="w-full bg-white/10 text-white placeholder:text-white/40 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500/50 mb-4 transition"
          />

          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5">
            {filtered.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
              >
                <div>
                  <span className="text-white text-sm">{lang.name}</span>
                  <span className="text-white/40 text-xs ml-2">{lang.nativeName}</span>
                </div>
                {selected === lang.code && (
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
