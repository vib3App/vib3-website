'use client';

import { Suspense } from 'react';
import { useVideoEditor, EDITOR_FILTERS } from '@/hooks/useVideoEditor';
import { EditorHeader, EditorTabs, TrimPanel, FilterPanel, TextPanel, AudioPanel, StickerPanel } from '@/components/edit';
import { TopNav } from '@/components/ui/TopNav';

function ProcessingModal({ progress }: { progress: { stage: string; percent: number; message: string } | null }) {
  if (!progress) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="glass-card rounded-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          {progress.stage === 'error' ? (
            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : progress.stage === 'complete' ? (
            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <>
              <svg className="w-16 h-16 animate-spin text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {progress.percent}%
              </span>
            </>
          )}
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
          {progress.stage === 'loading' && 'Loading Processor'}
          {progress.stage === 'processing' && 'Processing Video'}
          {progress.stage === 'encoding' && 'Encoding Video'}
          {progress.stage === 'complete' && 'Complete!'}
          {progress.stage === 'error' && 'Processing Failed'}
        </h3>
        <p className="text-white/60">{progress.message}</p>

        {progress.stage !== 'error' && progress.stage !== 'complete' && (
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EditLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
    </div>
  );
}

function EditContent() {
  const editor = useVideoEditor();

  if (!editor.videoUrl) {
    return <EditLoading />;
  }

  return (
    <div className="min-h-screen aurora-bg">
      <TopNav />
      <EditorHeader onCancel={editor.goBack} onDone={editor.handleDone} isProcessing={editor.isProcessing} />
      {editor.isProcessing && <ProcessingModal progress={editor.processingProgress} />}

      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        <video
          ref={editor.videoRef}
          src={editor.videoUrl}
          className="max-w-full max-h-full object-contain"
          style={{ filter: EDITOR_FILTERS[editor.selectedFilter].filter }}
          onLoadedMetadata={editor.handleVideoLoad}
          onTimeUpdate={editor.handleTimeUpdate}
          onPlay={() => editor.setIsPlaying(true)}
          onPause={() => editor.setIsPlaying(false)}
          playsInline
        />

        {editor.texts.map((text) => (
          <div
            key={text.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${text.x}%`,
              top: `${text.y}%`,
              transform: 'translate(-50%, -50%)',
              color: text.color,
              fontSize: text.fontSize,
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {text.text}
          </div>
        ))}

        {editor.stickers.map((sticker) => (
          <div
            key={sticker.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${sticker.x}%`,
              top: `${sticker.y}%`,
              transform: `translate(-50%, -50%) scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              fontSize: '48px',
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            {sticker.emoji}
          </div>
        ))}

        <button onClick={editor.togglePlayPause} className="absolute inset-0 flex items-center justify-center">
          {!editor.isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </button>

        <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm font-mono">
          {editor.formatTime(editor.currentTime)} / {editor.formatTime(editor.duration)}
        </div>
      </div>

      <div className="glass-card border-t border-white/5">
        <EditorTabs activeMode={editor.editMode} onModeChange={editor.setEditMode} />

        <div className="p-4 min-h-[200px]">
          {editor.editMode === 'trim' && (
            <TrimPanel
              videoLoaded={editor.videoLoaded}
              duration={editor.duration}
              currentTime={editor.currentTime}
              trimStart={editor.trimStart}
              trimEnd={editor.trimEnd}
              thumbnails={editor.thumbnails}
              timelineRef={editor.timelineRef}
              formatTime={editor.formatTime}
              onMouseDown={editor.handleTimelineMouseDown}
            />
          )}

          {editor.editMode === 'filters' && (
            <FilterPanel selectedFilter={editor.selectedFilter} onSelect={editor.setSelectedFilter} />
          )}

          {editor.editMode === 'text' && (
            <TextPanel
              texts={editor.texts}
              showTextInput={editor.showTextInput}
              newText={editor.newText}
              onShowTextInput={editor.setShowTextInput}
              onNewTextChange={editor.setNewText}
              onAddText={editor.addText}
              onRemoveText={editor.removeText}
            />
          )}

          {editor.editMode === 'stickers' && (
            <StickerPanel
              stickers={editor.stickers}
              onAddSticker={editor.addSticker}
              onRemoveSticker={editor.removeSticker}
            />
          )}

          {editor.editMode === 'audio' && (
            <AudioPanel volume={editor.volume} onVolumeChange={editor.updateVolume} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<EditLoading />}>
      <EditContent />
    </Suspense>
  );
}
