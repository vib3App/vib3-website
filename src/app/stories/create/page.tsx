'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import { storiesApi } from '@/services/api/stories';
import { TopNav } from '@/components/ui/TopNav';
import { StoryEditor } from '@/components/stories/StoryEditor';
import { StoryTimeline } from '@/components/stories/StoryTimeline';
import { useToastStore } from '@/stores/toastStore';
import { logger } from '@/utils/logger';

interface StorySegment {
  id: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  file: File;
  thumbnailUrl?: string;
  overlays?: { texts: { id: string; text: string; x: number; y: number; color: string; fontSize: number; fontWeight: string }[]; stickers: { id: string; emoji: string; x: number; y: number; scale: number }[] };
}

export default function CreateStoryPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const addToast = useToastStore(s => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [segments, setSegments] = useState<StorySegment[]>([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  const handleAddSegment = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemoveSegment = useCallback((index: number) => {
    setSegments(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setPreview(null);
        setSelectedFile(null);
      }
      return updated;
    });
    setActiveSegmentIndex(0);
  }, []);

  const handleEditorSave = useCallback((overlays: { texts: { id: string; text: string; x: number; y: number; color: string; fontSize: number; fontWeight: string }[]; stickers: { id: string; emoji: string; x: number; y: number; scale: number }[]; filter?: string; drawings?: unknown[] }) => {
    setSegments(prev => prev.map((s, i) => i === activeSegmentIndex ? { ...s, overlays } : s));
    setShowEditor(false);
  }, [activeSegmentIndex]);

  if (!isAuthVerified) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login?redirect=/stories/create');
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    const url = URL.createObjectURL(file);
    setPreview(url);
    setSegments(prev => [...prev, {
      id: `seg-${Date.now()}`,
      mediaUrl: url,
      mediaType: isVideo ? 'video' : 'image',
      duration: isVideo ? 15 : 5,
      file,
    }]);
    setActiveSegmentIndex(segments.length);
  };

  const handlePost = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      const { url } = await storiesApi.uploadStoryMedia(selectedFile);
      await storiesApi.createStory({
        mediaUrl: url,
        mediaType,
        caption: caption || undefined,
        duration: mediaType === 'image' ? 5 : undefined,
      });
      addToast('Story posted!', 'success');
      router.push('/feed');
    } catch (err) {
      logger.error('Failed to create story:', err);
      addToast('Failed to post story', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <main className="pt-20 md:pt-16 pb-8 max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-white mb-6">Create Story</h1>

        {!preview ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[9/16] rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:border-white/40 transition-colors"
          >
            <div className="w-16 h-16 rounded-full glass flex items-center justify-center">
              <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Add photo or video</p>
              <p className="text-white/40 text-sm mt-1">Tap to select from your files</p>
            </div>
          </button>
        ) : (
          <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black">
            {mediaType === 'video' ? (
              <video src={preview} className="w-full h-full object-cover" controls playsInline />
            ) : (
              <Image src={preview} alt="Preview" fill className="object-cover" />
            )}
            <button
              onClick={() => { setPreview(null); setSelectedFile(null); }}
              className="absolute top-3 right-3 w-8 h-8 glass rounded-full flex items-center justify-center text-white/70 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {preview && (
          <div className="mt-4 space-y-4">
            {/* Multi-segment timeline */}
            {segments.length > 0 && (
              <StoryTimeline
                segments={segments.map(s => ({ id: s.id, mediaUrl: s.mediaUrl, mediaType: s.mediaType, duration: s.duration, thumbnailUrl: s.thumbnailUrl }))}
                activeIndex={activeSegmentIndex}
                onSelectSegment={setActiveSegmentIndex}
                onReorderSegments={(reordered) => {
                  // Map reordered segments back to full segments with file
                  const reorderedFull = reordered.map(r => segments.find(s => s.id === r.id)!);
                  setSegments(reorderedFull);
                }}
                onRemoveSegment={handleRemoveSegment}
                onAddSegment={handleAddSegment}
              />
            )}

            {/* Edit button - opens story editor with text/sticker overlays */}
            <button
              onClick={() => setShowEditor(true)}
              className="w-full py-2.5 glass text-white rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Add Text & Stickers
            </button>

            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add a caption..."
              maxLength={150}
              className="w-full bg-white/5 text-white placeholder:text-white/30 rounded-xl px-4 py-3 outline-none border border-white/10 focus:border-purple-500/50"
            />
            <button
              onClick={handlePost}
              disabled={isUploading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-teal-500 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : 'Post Story'}
            </button>
          </div>
        )}

        {/* Story Editor overlay */}
        {showEditor && preview && (
          <StoryEditor
            mediaUrl={preview}
            mediaType={mediaType}
            onSave={handleEditorSave}
            onCancel={() => setShowEditor(false)}
          />
        )}
      </main>
    </div>
  );
}
