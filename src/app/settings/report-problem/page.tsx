'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { TopNav } from '@/components/ui/TopNav';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api/client';
import { logger } from '@/utils/logger';

const CATEGORIES = [
  'App Crash / Freeze',
  'Video Not Playing',
  'Upload Issue',
  'Account Problem',
  'Payment / Coins Issue',
  'Notification Problem',
  'Feed / Discovery Issue',
  'Messaging Problem',
  'Performance Issue',
  'Other',
];

export default function ReportProblemPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified, user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [screenshots, setScreenshots] = useState<{ file: File; preview: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newScreenshots = Array.from(files).slice(0, 3 - screenshots.length).map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setScreenshots(prev => [...prev, ...newScreenshots].slice(0, 3));
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => {
      const newList = [...prev];
      URL.revokeObjectURL(newList[index].preview);
      newList.splice(index, 1);
      return newList;
    });
  };

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      setError('Please select a category and describe the problem');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('userAgent', navigator.userAgent);
      formData.append('url', window.location.href);
      screenshots.forEach((ss, i) => {
        formData.append(`screenshot_${i}`, ss.file);
      });

      await apiClient.post('/reports/problem', formData);
      setSubmitted(true);
    } catch (err) {
      logger.error('Failed to submit report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthVerified) return null;
  if (!isAuthenticated) { router.push('/login?redirect=/settings/report-problem'); return null; }

  if (submitted) {
    return (
      <div className="min-h-screen relative">
        <AuroraBackground intensity={20} />
        <TopNav />
        <main className="pt-20 md:pt-16 pb-8 relative z-10 flex flex-col items-center justify-center min-h-[60vh]">
          <svg className="w-16 h-16 text-green-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-white text-xl font-bold mb-2">Report Submitted</h2>
          <p className="text-white/50 text-sm mb-6">Thank you! We will look into this issue.</p>
          <button
            onClick={() => router.push('/settings')}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-full text-sm font-medium hover:opacity-90 transition"
          >
            Back to Settings
          </button>
        </main>
      </div>
    );
  }

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
            <h1 className="text-xl font-bold text-white">Report a Problem</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
          )}

          {/* Category */}
          <div>
            <label className="text-white/70 text-sm block mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white/10 text-white rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500/50 transition appearance-none"
            >
              <option value="" className="bg-neutral-900">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-neutral-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/70 text-sm block mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please describe the problem in detail..."
              rows={5}
              maxLength={2000}
              className="w-full bg-white/10 text-white placeholder:text-white/30 rounded-xl px-4 py-3 text-sm outline-none border border-white/10 focus:border-purple-500/50 resize-none transition"
            />
            <p className="text-white/30 text-xs mt-1">{description.length}/2000</p>
          </div>

          {/* Screenshots */}
          <div>
            <label className="text-white/70 text-sm block mb-2">Screenshots (optional, max 3)</label>
            <div className="flex gap-3 flex-wrap">
              {screenshots.map((ss, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
                  <Image src={ss.preview} alt={`Screenshot ${i + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => removeScreenshot(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              {screenshots.length < 3 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center hover:border-white/40 transition"
                >
                  <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleAddScreenshot} className="hidden" />
          </div>

          {/* Device info */}
          <div className="glass-card rounded-xl p-4">
            <h4 className="text-white/50 text-xs font-medium mb-2">Device Info (auto-detected)</h4>
            <p className="text-white/30 text-xs">{user?.username} | {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'N/A'}</p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !category || !description.trim()}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-400 text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </main>
    </div>
  );
}
