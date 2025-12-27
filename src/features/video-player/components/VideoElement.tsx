/**
 * VideoElement - Pure HTML5 video wrapper
 * Only handles the video element, no controls or business logic
 */
'use client';

import { forwardRef, VideoHTMLAttributes } from 'react';

interface VideoElementProps extends VideoHTMLAttributes<HTMLVideoElement> {
  aspectRatio?: number;
}

export const VideoElement = forwardRef<HTMLVideoElement, VideoElementProps>(
  ({ aspectRatio, className = '', style, ...props }, ref) => {
    const aspectRatioStyle = aspectRatio
      ? { aspectRatio: `${aspectRatio}` }
      : {};

    return (
      <video
        ref={ref}
        className={`w-full h-full object-contain bg-black ${className}`}
        style={{ ...aspectRatioStyle, ...style }}
        playsInline
        webkit-playsinline="true"
        {...props}
      />
    );
  }
);

VideoElement.displayName = 'VideoElement';
