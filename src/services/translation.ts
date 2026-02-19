/**
 * Translation service (Gap #98)
 * Uses LibreTranslate API or browser experimental Translation API.
 * Caches translations in memory with 7-day TTL.
 */

const LIBRE_TRANSLATE_URL = process.env.NEXT_PUBLIC_LIBRE_TRANSLATE_URL || 'https://libretranslate.com';

interface CacheEntry {
  text: string;
  timestamp: number;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const cache = new Map<string, CacheEntry>();

function getCacheKey(text: string, targetLang: string): string {
  return `${targetLang}::${text.slice(0, 200)}`;
}

function getFromCache(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.text;
}

function setCache(key: string, text: string): void {
  cache.set(key, { text, timestamp: Date.now() });
  // Evict oldest entries if cache gets too large
  if (cache.size > 1000) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

/**
 * Detect language of text using LibreTranslate
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const res = await fetch(`${LIBRE_TRANSLATE_URL}/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text }),
    });
    if (!res.ok) throw new Error('Detection failed');
    const data = await res.json();
    return data[0]?.language || 'en';
  } catch {
    return 'en';
  }
}

/**
 * Translate text to target language.
 * Checks cache first, falls back to LibreTranslate API.
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = 'auto'
): Promise<string> {
  if (!text.trim()) return text;

  const cacheKey = getCacheKey(text, targetLang);
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  try {
    // Try browser experimental Translation API first
    if ('translation' in navigator) {
      const browserResult = await tryBrowserTranslation(text, targetLang, sourceLang);
      if (browserResult) {
        setCache(cacheKey, browserResult);
        return browserResult;
      }
    }

    // Fallback to LibreTranslate
    const res = await fetch(`${LIBRE_TRANSLATE_URL}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!res.ok) throw new Error(`Translation failed: ${res.status}`);
    const data = await res.json();
    const translated = data.translatedText || text;
    setCache(cacheKey, translated);
    return translated;
  } catch {
    // Return original text on failure
    return text;
  }
}

/**
 * Try browser experimental Translation API
 */
async function tryBrowserTranslation(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (!nav.translation?.createTranslator) return null;
    const translator = await nav.translation.createTranslator({
      sourceLanguage: sourceLang === 'auto' ? 'en' : sourceLang,
      targetLanguage: targetLang,
    });
    const result = await translator.translate(text);
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Get supported languages from LibreTranslate
 */
export async function getSupportedLanguages(): Promise<{ code: string; name: string }[]> {
  try {
    const res = await fetch(`${LIBRE_TRANSLATE_URL}/languages`);
    if (!res.ok) return getDefaultLanguages();
    return await res.json();
  } catch {
    return getDefaultLanguages();
  }
}

function getDefaultLanguages(): { code: string; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' },
  ];
}

/**
 * Clear the translation cache
 */
export function clearTranslationCache(): void {
  cache.clear();
}
