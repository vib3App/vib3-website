'use client';

import { RefObject } from 'react';
import { VideoCameraIcon } from '@heroicons/react/24/outline';
import type { RemixType } from '@/types/collaboration';
import type { Video } from '@/types';

interface RemixVideoPreviewProps {
  remixType: RemixType;
  originalVideo: Video;
  splitPosition: number;
  isRecording: boolean;
  mediaStream: MediaStream | null;
  recordedUrl: string | null;
  originalVideoRef: RefObject<HTMLVideoElement | null>;
  cameraVideoRef: RefObject<HTMLVideoElement | null>;
}

export function RemixVideoPreview({
  remixType,
  originalVideo,
  splitPosition,
  isRecording,
  mediaStream,
  recordedUrl,
  originalVideoRef,
  cameraVideoRef,
}: RemixVideoPreviewProps) {
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-900 ${
      remixType === 'duet' ? 'aspect-video' : 'aspect-[9/16] max-w-sm mx-auto'
    }`}>
      {remixType === 'duet' ? (
        <DuetLayout
          originalVideo={originalVideo}
          splitPosition={splitPosition}
          isRecording={isRecording}
          mediaStream={mediaStream}
          recordedUrl={recordedUrl}
          originalVideoRef={originalVideoRef}
          cameraVideoRef={cameraVideoRef}
        />
      ) : remixType === 'stitch' ? (
        <StitchLayout
          originalVideo={originalVideo}
          isRecording={isRecording}
          mediaStream={mediaStream}
          recordedUrl={recordedUrl}
          originalVideoRef={originalVideoRef}
          cameraVideoRef={cameraVideoRef}
        />
      ) : (
        <EchoLayout
          originalVideo={originalVideo}
          isRecording={isRecording}
          mediaStream={mediaStream}
          recordedUrl={recordedUrl}
          originalVideoRef={originalVideoRef}
          cameraVideoRef={cameraVideoRef}
        />
      )}

      {isRecording && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full" />
          REC
        </div>
      )}
    </div>
  );
}

function DuetLayout({ originalVideo, splitPosition, isRecording, mediaStream, recordedUrl, originalVideoRef, cameraVideoRef }: Omit<RemixVideoPreviewProps, 'remixType'>) {
  return (
    <div className="absolute inset-0 flex">
      <div style={{ width: `${splitPosition}%` }} className="relative">
        <video
          ref={originalVideoRef}
          src={originalVideo.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop={!isRecording}
        />
      </div>
      <div style={{ width: `${100 - splitPosition}%` }} className="relative bg-gray-800">
        {recordedUrl ? (
          <video src={recordedUrl} className="absolute inset-0 w-full h-full object-cover" playsInline />
        ) : (
          <video ref={cameraVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
        )}
        {!mediaStream && !recordedUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoCameraIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
}

function StitchLayout({ originalVideo, isRecording, mediaStream, recordedUrl, originalVideoRef, cameraVideoRef }: Omit<RemixVideoPreviewProps, 'remixType' | 'splitPosition'>) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex-1 relative bg-gray-800">
        {recordedUrl ? (
          <video src={recordedUrl} className="absolute inset-0 w-full h-full object-cover" playsInline />
        ) : (
          <video ref={cameraVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
        )}
        {!mediaStream && !recordedUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <VideoCameraIcon className="w-12 h-12 text-gray-600" />
          </div>
        )}
      </div>
      <div className="flex-1 relative">
        <video
          ref={originalVideoRef}
          src={originalVideo.videoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          loop={!isRecording}
        />
      </div>
    </div>
  );
}

function EchoLayout({ originalVideo, isRecording, mediaStream, recordedUrl, originalVideoRef, cameraVideoRef }: Omit<RemixVideoPreviewProps, 'remixType' | 'splitPosition'>) {
  return (
    <div className="absolute inset-0">
      <video
        ref={originalVideoRef}
        src={originalVideo.videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        loop={!isRecording}
      />
      <div className="absolute bottom-4 right-4 w-32 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
        {recordedUrl ? (
          <video src={recordedUrl} className="w-full h-full object-cover" playsInline />
        ) : (
          <>
            <video ref={cameraVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            {!mediaStream && !recordedUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <VideoCameraIcon className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
