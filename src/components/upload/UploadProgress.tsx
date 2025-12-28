'use client';

interface UploadProgressProps {
  progress: number;
  onCancel: () => void;
}

export function UploadProgress({ progress, onCancel }: UploadProgressProps) {
  return (
    <div className="text-center py-12">
      <div className="w-32 h-32 mx-auto mb-6 relative">
        <svg className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
          <circle
            cx="64"
            cy="64"
            r="60"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={377}
            strokeDashoffset={377 - (377 * Math.min(progress, 100)) / 100}
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Uploading your video...</h2>
      <p className="text-white/50 mb-6">This may take a moment</p>
      <button onClick={onCancel} className="text-white/50 hover:text-white">
        Cancel
      </button>
    </div>
  );
}

export function ProcessingIndicator() {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-6 relative">
        <div className="w-full h-full rounded-full border-4 border-white/10 border-t-purple-500 animate-spin" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Processing video...</h2>
      <p className="text-white/50">Almost there!</p>
    </div>
  );
}
