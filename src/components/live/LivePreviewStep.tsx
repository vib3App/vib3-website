'use client';

import {
  VideoCameraIcon, PhotoIcon, Cog6ToothIcon,
  MicrophoneIcon, GlobeAltIcon, LockClosedIcon, CalendarIcon,
} from '@heroicons/react/24/outline';

interface LivePreviewStepProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  audioEnabled: boolean;
  videoEnabled: boolean;
  thumbnailUrl: string | null;
  title: string;
  description: string;
  isPrivate: boolean;
  allowGuests: boolean;
  maxGuests: number;
  isScheduling: boolean;
  scheduledFor: string;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onCaptureThumbnail: () => void;
  onRemoveThumbnail: () => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (desc: string) => void;
  onPrivateChange: (isPrivate: boolean) => void;
  onAllowGuestsChange: (allow: boolean) => void;
  onMaxGuestsChange: (max: number) => void;
  onSchedulingChange: (scheduling: boolean) => void;
  onScheduledForChange: (time: string) => void;
  onBackToSetup: () => void;
}

export function LivePreviewStep({
  videoRef, canvasRef, audioEnabled, videoEnabled, thumbnailUrl,
  title, description, isPrivate, allowGuests, maxGuests, isScheduling, scheduledFor,
  onToggleAudio, onToggleVideo, onCaptureThumbnail, onRemoveThumbnail,
  onTitleChange, onDescriptionChange, onPrivateChange, onAllowGuestsChange,
  onMaxGuestsChange, onSchedulingChange, onScheduledForChange, onBackToSetup,
}: LivePreviewStepProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className={`w-full h-full object-cover ${!videoEnabled ? 'opacity-0' : ''}`}
          />
          {!videoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoCameraIcon className="w-16 h-16 text-gray-600" />
            </div>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button onClick={onToggleAudio} className={`p-3 rounded-full transition ${audioEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'}`}>
              <MicrophoneIcon className="w-5 h-5" />
            </button>
            <button onClick={onToggleVideo} className={`p-3 rounded-full transition ${videoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500'}`}>
              <VideoCameraIcon className="w-5 h-5" />
            </button>
            <button onClick={onCaptureThumbnail} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition" title="Capture thumbnail">
              <PhotoIcon className="w-5 h-5" />
            </button>
            <button onClick={onBackToSetup} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition">
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        {thumbnailUrl && (
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
            <img src={thumbnailUrl} alt="Thumbnail" className="w-24 aspect-video object-cover rounded-lg" />
            <div className="flex-1">
              <div className="text-sm font-medium">Custom Thumbnail</div>
              <div className="text-xs text-gray-400">Captured from preview</div>
            </div>
            <button onClick={onRemoveThumbnail} className="text-sm text-red-400 hover:text-red-300">Remove</button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Stream Title *</label>
          <input
            type="text" value={title} onChange={(e) => onTitleChange(e.target.value)}
            placeholder="What's your stream about?" maxLength={100}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Description</label>
          <textarea
            value={description} onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Tell viewers what to expect..." rows={3}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Privacy</label>
          <div className="flex gap-4">
            {[{ val: false, icon: GlobeAltIcon, label: 'Public' }, { val: true, icon: LockClosedIcon, label: 'Private' }].map(
              ({ val, icon: Icon, label }) => (
                <button key={label} onClick={() => onPrivateChange(val)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                    isPrivate === val ? 'border-pink-500 bg-pink-500/10' : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <Icon className="w-5 h-5" />{label}
                </button>
              )
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div><div className="font-medium">Allow Guests</div><div className="text-sm text-gray-400">Let viewers join</div></div>
            <button onClick={() => onAllowGuestsChange(!allowGuests)} className={`w-12 h-6 rounded-full transition ${allowGuests ? 'bg-pink-500' : 'bg-white/20'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${allowGuests ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {allowGuests && (
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">Max guests:</label>
              <select value={maxGuests} onChange={(e) => onMaxGuestsChange(Number(e.target.value))}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500">
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            <div><div className="font-medium">Schedule for later</div><div className="text-sm text-gray-400">Set a time to go live</div></div>
          </div>
          <button onClick={() => onSchedulingChange(!isScheduling)} className={`w-12 h-6 rounded-full transition ${isScheduling ? 'bg-pink-500' : 'bg-white/20'}`}>
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isScheduling ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        {isScheduling && (
          <input type="datetime-local" value={scheduledFor} onChange={(e) => onScheduledForChange(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-pink-500" />
        )}
      </div>
    </div>
  );
}
