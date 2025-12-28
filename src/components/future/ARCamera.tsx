'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAR, arFilters } from '@/hooks/useAR';

interface ARCameraProps {
  className?: string;
  onCapture?: (dataUrl: string) => void;
}

/**
 * AR-ready camera component with filter support
 */
export function ARCamera({ className = '', onCapture }: ARCameraProps) {
  const {
    capabilities,
    session,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    applyFilter,
    removeFilter,
    capturePhoto,
  } = useAR();

  const [showFilters, setShowFilters] = useState(false);

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (dataUrl && onCapture) {
      onCapture(dataUrl);
    }
  };

  if (!capabilities.isSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 glass-card rounded-2xl ${className}`}>
        <span className="text-4xl mb-4">📷</span>
        <p className="text-white/70 text-center">
          Camera not available on this device
        </p>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black ${className}`}>
      {/* Video preview */}
      <video
        ref={videoRef as React.RefObject<HTMLVideoElement>}
        className="w-full h-full object-cover"
        playsInline
        muted
      />

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef as React.RefObject<HTMLCanvasElement>} className="hidden" />

      {/* Filter overlay */}
      {session.filter && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: session.filter.intensity }}
          style={{
            background: session.filter.type === 'effect'
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2))'
              : 'transparent',
          }}
        />
      )}

      {/* Controls overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        {!session.isActive ? (
          <motion.button
            className="w-full py-3 bg-purple-500 rounded-xl text-white font-medium"
            onClick={startCamera}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Camera
          </motion.button>
        ) : (
          <div className="flex items-center justify-between">
            {/* Close button */}
            <motion.button
              className="p-3 bg-white/10 rounded-full"
              onClick={stopCamera}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>

            {/* Capture button */}
            <motion.button
              className="w-16 h-16 rounded-full bg-white border-4 border-purple-500"
              onClick={handleCapture}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            />

            {/* Filters button */}
            <motion.button
              className={`p-3 rounded-full ${showFilters ? 'bg-purple-500' : 'bg-white/10'}`}
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✨
            </motion.button>
          </div>
        )}
      </div>

      {/* Filter selector */}
      <AnimatePresence>
        {showFilters && session.isActive && (
          <motion.div
            className="absolute inset-x-0 bottom-24 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {/* None option */}
              <motion.button
                className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                  !session.filter ? 'bg-purple-500' : 'bg-white/10'
                }`}
                onClick={removeFilter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-sm">🚫</span>
                <span className="text-xs text-white/70 mt-1">None</span>
              </motion.button>

              {arFilters.map((filter) => (
                <motion.button
                  key={filter.id}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center ${
                    session.filter?.id === filter.id ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                  onClick={() => applyFilter(filter)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">
                    {filter.type === 'effect' ? '✨' : filter.type === 'mask' ? '🎭' : '👓'}
                  </span>
                  <span className="text-xs text-white/70 mt-1 truncate w-full text-center px-1">
                    {filter.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WebXR badge */}
      {capabilities.hasWebXR && (
        <div className="absolute top-4 right-4">
          <motion.div
            className="px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full
                       text-purple-300 text-xs flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span>🥽</span>
            <span>XR Ready</span>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default ARCamera;
