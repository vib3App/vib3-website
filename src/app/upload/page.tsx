'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { aiApi, type VideoOutlinePlan } from '@/services/api/ai';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useUpload } from '@/hooks/useUpload';
import { TopNav } from '@/components/ui/TopNav';
import {
  VideoDropzone,
  DraftsPanel,
  VideoPreviewEditor,
  VideoDetailsForm,
  UploadProgress,
  ProcessingIndicator,
  UploadComplete,
  AIVideoOutline,
  CodecSelector,
  CompressionOptions,
} from '@/components/upload';

export default function UploadPage() {
  return (
    <Suspense fallback={<UploadLoading />}>
      <UploadPageContent />
    </Suspense>
  );
}

function UploadLoading() {
  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin" />
    </div>
  );
}

function UploadPageContent() {
  const router = useRouter();
  const { isAuthenticated, isAuthVerified } = useAuthStore();
  const upload = useUpload(isAuthenticated, isAuthVerified);

  // AI Video Outline — real backend call (was a setTimeout showing hardcoded
  // fake "scene analysis"; see AIVideoOutline.tsx header for the history).
  const [outline, setOutline] = useState<VideoOutlinePlan | null>(null);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [outlineError, setOutlineError] = useState<string | null>(null);

  const handleGenerateOutline = useCallback(async (topic: string) => {
    setIsGeneratingOutline(true);
    setOutlineError(null);
    try {
      const plan = await aiApi.generateOutline({ topic });
      setOutline(plan);
    } catch {
      setOutline(null);
      setOutlineError('Outline generation failed — try again in a moment.');
    } finally {
      setIsGeneratingOutline(false);
    }
  }, []);

  // Gap #35: Codec selection state
  const [selectedCodec, setSelectedCodec] = useState('h264');

  // Gap #36: Compression state
  const [compressionEnabled, setCompressionEnabled] = useState(false);
  const [targetBitrate, setTargetBitrate] = useState(5);

  useEffect(() => {
    // Wait for auth to be verified before checking isAuthenticated
    if (!isAuthVerified) {
      return;
    }
    if (!isAuthenticated) {
      router.push('/login?redirect=/upload');
    }
  }, [isAuthenticated, isAuthVerified, router]);

  // Show loading while auth is being verified or if not authenticated yet
  if (!isAuthVerified || !isAuthenticated) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const isScheduled = upload.showSchedule && !!upload.scheduleDate && !!upload.scheduleTime;
  const scheduledDate = isScheduled ? `${upload.scheduleDate}T${upload.scheduleTime}` : undefined;

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />

      <main className="pt-20 md:pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <UploadHeader
            step={upload.step}
            draftsCount={upload.drafts.length}
            showDrafts={upload.showDrafts}
            onToggleDrafts={() => upload.setShowDrafts(!upload.showDrafts)}
            onBack={upload.goBack}
          />

          {/* Error Message */}
          {upload.error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {upload.error}
            </div>
          )}

          {/* Drafts Panel */}
          {upload.showDrafts && (
            <DraftsPanel
              drafts={upload.drafts}
              onLoadDraft={upload.handleLoadDraft}
              onDeleteDraft={upload.handleDeleteDraft}
            />
          )}

          {/* Step: Select Video */}
          {upload.step === 'select' && (
            <>
              <VideoDropzone
                isDragging={upload.isDragging}
                onDragOver={upload.handleDragOver}
                onDragLeave={upload.handleDragLeave}
                onDrop={upload.handleDrop}
                onFileSelect={upload.handleFileSelect}
              />
              <button
                onClick={() => router.push('/slideshow')}
                className="mt-3 w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center" aria-hidden="true">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 15l4-4a2 2 0 012.83 0L15 16" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-white">Create from photos</span>
                    <span className="block text-xs text-white/50">Build a slideshow video with transitions + music</span>
                  </span>
                </span>
                <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          {/* Step: Edit Video */}
          {upload.step === 'edit' && upload.videoPreviewUrl && (
            <VideoPreviewEditor
              videoUrl={upload.videoPreviewUrl}
              thumbnailOptions={upload.thumbnailOptions}
              selectedThumbnail={upload.selectedThumbnail}
              onThumbnailSelect={upload.setSelectedThumbnail}
              onCustomThumbnail={upload.handleCustomThumbnail}
              onNext={() => upload.setStep('details')}
            />
          )}

          {/* Step: Details */}
          {upload.step === 'details' && (
            <div className="space-y-6">
              <VideoDetailsForm
                thumbnail={upload.selectedThumbnail}
                caption={upload.caption}
                onCaptionChange={upload.setCaption}
                hashtags={upload.hashtags}
                onHashtagsChange={upload.setHashtags}
                selectedVibe={upload.selectedVibe}
                onVibeChange={upload.setSelectedVibe}
                visibility={upload.visibility}
                onVisibilityChange={upload.setVisibility}
                allowComments={upload.allowComments}
                onAllowCommentsChange={upload.setAllowComments}
                allowDuet={upload.allowDuet}
                onAllowDuetChange={upload.setAllowDuet}
                allowStitch={upload.allowStitch}
                onAllowStitchChange={upload.setAllowStitch}
                showSchedule={upload.showSchedule}
                onShowScheduleChange={upload.setShowSchedule}
                scheduleDate={upload.scheduleDate}
                onScheduleDateChange={upload.setScheduleDate}
                scheduleTime={upload.scheduleTime}
                onScheduleTimeChange={upload.setScheduleTime}
                onSaveDraft={upload.handleSaveDraft}
                onPublish={upload.handleUpload}
                isSavingDraft={upload.isSavingDraft}
                location={upload.location}
                onLocationChange={upload.setLocation}
                mentions={upload.mentions}
                onMentionsChange={upload.setMentions}
                uploadQuality={upload.uploadQuality}
                onUploadQualityChange={upload.setUploadQuality}
                watermarkEnabled={upload.watermarkEnabled}
                onWatermarkToggle={upload.setWatermarkEnabled}
                watermarkPosition={upload.watermarkPosition}
                onWatermarkPositionChange={upload.setWatermarkPosition}
                watermarkText={upload.watermarkText}
                onWatermarkTextChange={upload.setWatermarkText}
                watermarkOpacity={upload.watermarkOpacity}
                onWatermarkOpacityChange={upload.setWatermarkOpacity}
              />

              <AIVideoOutline
                defaultTopic={upload.caption}
                outline={outline}
                isGenerating={isGeneratingOutline}
                error={outlineError}
                onGenerate={handleGenerateOutline}
              />

              {/* Gap #35: Codec Selector */}
              <CodecSelector
                selectedCodec={selectedCodec}
                onCodecChange={setSelectedCodec}
              />

              {/* Gap #36: Compression Options */}
              <CompressionOptions
                enabled={compressionEnabled}
                onToggle={() => setCompressionEnabled(v => !v)}
                targetBitrate={targetBitrate}
                onBitrateChange={setTargetBitrate}
                originalSize={upload.videoFile?.size ?? null}
              />
            </div>
          )}

          {/* Step: Uploading */}
          {upload.step === 'uploading' && (
            <UploadProgress
              progress={upload.uploadProgress}
              onCancel={upload.handleCancelUpload}
            />
          )}

          {/* Step: Processing */}
          {upload.step === 'processing' && <ProcessingIndicator />}

          {/* Step: Complete */}
          {upload.step === 'complete' && (
            <UploadComplete
              isScheduled={isScheduled}
              scheduledDate={scheduledDate}
              onUploadAnother={upload.resetForm}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function UploadHeader({
  step,
  draftsCount,
  showDrafts: _showDrafts,
  onToggleDrafts,
  onBack,
}: {
  step: string;
  draftsCount: number;
  showDrafts: boolean;
  onToggleDrafts: () => void;
  onBack: () => void;
}) {
  const showBackButton = step !== 'select' && step !== 'complete' && step !== 'uploading' && step !== 'processing';

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-2 glass rounded-xl text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
          Create
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {draftsCount > 0 && step === 'select' && (
          <button
            onClick={onToggleDrafts}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-white/70 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Drafts
            <span className="px-1.5 py-0.5 bg-purple-500/30 text-purple-300 text-xs rounded-full">{draftsCount}</span>
          </button>
        )}
      </div>
    </div>
  );
}
