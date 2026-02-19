'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

export interface CustomFont {
  name: string;
  family: string;
  data: ArrayBuffer;
}

interface FontUploaderProps {
  customFonts: CustomFont[];
  onFontsChange: (fonts: CustomFont[]) => void;
  selectedFont: string;
  onFontSelect: (fontFamily: string) => void;
}

const BUILT_IN_FONTS = [
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
  'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana',
  'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino',
];

const DB_NAME = 'vib3-fonts';
const STORE_NAME = 'fonts';

async function openFontDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE_NAME, { keyPath: 'name' }); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveFontToDB(font: CustomFont): Promise<void> {
  const db = await openFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ name: font.name, family: font.family, data: font.data });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadFontsFromDB(): Promise<CustomFont[]> {
  const db = await openFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as CustomFont[]);
    req.onerror = () => reject(req.error);
  });
}

async function deleteFontFromDB(name: string): Promise<void> {
  const db = await openFontDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(name);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function registerFont(name: string, data: ArrayBuffer): Promise<void> {
  const fontFace = new FontFace(name, data);
  await fontFace.load();
  document.fonts.add(fontFace);
}

export function FontUploader({ customFonts, onFontsChange, selectedFont, onFontSelect }: FontUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);

  // Load fonts from IndexedDB on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadFontsFromDB().then(async (stored) => {
      if (stored.length === 0) return;
      for (const font of stored) {
        try { await registerFont(font.family, font.data); } catch {}
      }
      onFontsChange(stored);
    }).catch(() => {});
  }, [onFontsChange]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const newFonts: CustomFont[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'ttf' && ext !== 'woff2' && ext !== 'woff' && ext !== 'otf') {
          setError('Supported formats: .ttf, .woff2, .woff, .otf');
          continue;
        }

        const data = await file.arrayBuffer();
        const baseName = file.name.replace(/\.[^.]+$/, '');
        const family = `custom-${baseName}-${Date.now()}`;

        await registerFont(family, data);
        const font: CustomFont = { name: baseName, family, data };
        await saveFontToDB(font);
        newFonts.push(font);
      }

      if (newFonts.length > 0) {
        onFontsChange([...customFonts, ...newFonts]);
      }
    } catch {
      setError('Failed to load font file.');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [customFonts, onFontsChange]);

  const handleRemoveFont = useCallback(async (font: CustomFont) => {
    await deleteFontFromDB(font.name);
    onFontsChange(customFonts.filter(f => f.name !== font.name));
    if (selectedFont === font.family) onFontSelect('sans-serif');
  }, [customFonts, onFontsChange, selectedFont, onFontSelect]);

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">Fonts</h3>

      {/* Built-in fonts */}
      <div>
        <p className="text-white/40 text-xs mb-2">Built-in</p>
        <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto scrollbar-hide">
          {BUILT_IN_FONTS.map(font => (
            <button key={font} onClick={() => onFontSelect(font)}
              className={`text-left px-3 py-2 rounded-lg text-sm transition truncate ${
                selectedFont === font
                  ? 'ring-2 ring-purple-500 bg-purple-500/20 text-white'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              style={{ fontFamily: font }}>
              {font}
            </button>
          ))}
        </div>
      </div>

      {/* Custom fonts */}
      {customFonts.length > 0 && (
        <div>
          <p className="text-white/40 text-xs mb-2">Custom Fonts</p>
          <div className="space-y-1.5">
            {customFonts.map(font => (
              <div key={font.name}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition ${
                  selectedFont === font.family
                    ? 'ring-2 ring-purple-500 bg-purple-500/20'
                    : 'bg-white/5 hover:bg-white/10'
                }`}>
                <button onClick={() => onFontSelect(font.family)}
                  className="text-white text-sm flex-1 text-left truncate"
                  style={{ fontFamily: font.family }}>
                  {font.name}
                </button>
                <button onClick={() => handleRemoveFont(font)}
                  className="text-white/30 hover:text-red-400 ml-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload button */}
      <div>
        <input ref={fileInputRef} type="file" accept=".ttf,.woff2,.woff,.otf"
          multiple onChange={handleFileUpload} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="w-full py-3 border border-dashed border-white/20 text-white/50 rounded-xl hover:border-white/40 transition disabled:opacity-50">
          {isLoading ? 'Loading...' : '+ Upload Font (.ttf, .woff2)'}
        </button>
      </div>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      <p className="text-white/25 text-xs">Fonts are saved in your browser for future sessions via IndexedDB.</p>
    </div>
  );
}
