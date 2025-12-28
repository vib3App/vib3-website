'use client';

import Link from 'next/link';
import { ArrowLeftIcon, SignalIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useLiveSetup } from '@/hooks/useLiveSetup';
import { LiveSetupStep, LivePreviewStep } from '@/components/live';

function StartingState({ isScheduling }: { isScheduling: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-6" />
      <h2 className="text-xl font-semibold mb-2">
        {isScheduling ? 'Scheduling your stream...' : 'Starting your stream...'}
      </h2>
      <p className="text-gray-400">Please wait...</p>
    </div>
  );
}

export default function StartLivePage() {
  const live = useLiveSetup();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/live" className="p-2 hover:bg-white/10 rounded-full transition">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Go Live</h1>
          </div>
          {live.step === 'preview' && (
            <button
              onClick={live.handleGoLive}
              disabled={!live.title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-medium transition"
            >
              <SignalIcon className="w-5 h-5" />
              {live.isScheduling ? 'Schedule' : 'Go Live'}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {live.error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
            <span>{live.error}</span>
          </div>
        )}

        {live.step === 'setup' && (
          <LiveSetupStep
            streamMode={live.streamMode}
            onStreamModeChange={live.setStreamMode}
            cameras={live.cameras}
            mics={live.mics}
            selectedCamera={live.selectedCamera}
            selectedMic={live.selectedMic}
            onCameraChange={live.setSelectedCamera}
            onMicChange={live.setSelectedMic}
            onStartPreview={live.startPreview}
          />
        )}

        {live.step === 'preview' && (
          <LivePreviewStep
            videoRef={live.videoRef}
            canvasRef={live.canvasRef}
            audioEnabled={live.audioEnabled}
            videoEnabled={live.videoEnabled}
            thumbnailUrl={live.thumbnailUrl}
            title={live.title}
            description={live.description}
            isPrivate={live.isPrivate}
            allowGuests={live.allowGuests}
            maxGuests={live.maxGuests}
            isScheduling={live.isScheduling}
            scheduledFor={live.scheduledFor}
            onToggleAudio={live.toggleAudio}
            onToggleVideo={live.toggleVideo}
            onCaptureThumbnail={live.captureThumbnail}
            onRemoveThumbnail={() => live.setThumbnailUrl(null)}
            onTitleChange={live.setTitle}
            onDescriptionChange={live.setDescription}
            onPrivateChange={live.setIsPrivate}
            onAllowGuestsChange={live.setAllowGuests}
            onMaxGuestsChange={live.setMaxGuests}
            onSchedulingChange={live.setIsScheduling}
            onScheduledForChange={live.setScheduledFor}
            onBackToSetup={() => live.setStep('setup')}
          />
        )}

        {live.step === 'starting' && <StartingState isScheduling={live.isScheduling} />}
      </main>
    </div>
  );
}
