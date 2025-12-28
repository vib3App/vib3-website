'use client';

import Link from 'next/link';
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRemix } from '@/hooks/useRemix';
import {
  RemixHeader,
  RemixTypeSelector,
  RemixVideoPreview,
  RemixControls,
  RemixSidebar,
} from '@/components/remix';

export default function RemixPage() {
  const remix = useRemix();

  if (remix.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!remix.originalVideo) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <VideoCameraIcon className="w-16 h-16 text-gray-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Video not found</h1>
        <Link href="/" className="text-pink-400 hover:underline">Go home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <RemixHeader
        videoId={remix.videoId}
        remixType={remix.remixType}
        recordedBlob={remix.recordedBlob}
        uploading={remix.uploading}
        onSubmit={remix.handleSubmit}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!remix.recordedBlob && (
          <RemixTypeSelector
            remixType={remix.remixType}
            permissions={remix.permissions}
            onSelect={remix.setRemixType}
          />
        )}

        {!remix.canRemix ? (
          <div className="text-center py-20">
            <XMarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">
              {remix.remixType.charAt(0).toUpperCase() + remix.remixType.slice(1)} not allowed
            </h2>
            <p className="text-gray-400">
              The creator has disabled {remix.remixType} for this video.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RemixVideoPreview
                remixType={remix.remixType}
                originalVideo={remix.originalVideo}
                splitPosition={remix.splitPosition}
                isRecording={remix.isRecording}
                mediaStream={remix.mediaStream}
                recordedUrl={remix.recordedUrl}
                originalVideoRef={remix.originalVideoRef}
                cameraVideoRef={remix.cameraVideoRef}
              />

              {remix.remixType === 'duet' && !remix.recordedBlob && (
                <div className="mt-4">
                  <label className="text-sm text-gray-400 mb-2 block">Split Position</label>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={remix.splitPosition}
                    onChange={(e) => remix.setSplitPosition(Number(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                </div>
              )}

              <RemixControls
                mediaStream={remix.mediaStream}
                recordedBlob={remix.recordedBlob}
                isRecording={remix.isRecording}
                isPlaying={remix.isPlaying}
                onStartCamera={remix.startCamera}
                onStartRecording={remix.startRecording}
                onStopRecording={remix.stopRecording}
                onTogglePlayback={remix.togglePlayback}
                onRetry={remix.retryRecording}
              />
            </div>

            <RemixSidebar
              originalVideo={remix.originalVideo}
              remixType={remix.remixType}
              recordedBlob={remix.recordedBlob}
              title={remix.title}
              description={remix.description}
              onTitleChange={remix.setTitle}
              onDescriptionChange={remix.setDescription}
            />
          </div>
        )}
      </main>
    </div>
  );
}
