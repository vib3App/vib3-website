'use client';

import { Suspense } from 'react';
import { useVideoEditor, EDITOR_FILTERS } from '@/hooks/useVideoEditor';
import { EditorHeader, EditorTabs, TrimPanel, FilterPanel, TextPanel, AudioPanel } from '@/components/edit';
import { TopNav } from '@/components/ui/TopNav';

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
      <EditorHeader onCancel={editor.goBack} onDone={editor.handleDone} />

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
            <div className="text-center text-white/50 py-8">
              <span className="text-4xl mb-4 block">🎨</span>
              <p>Stickers coming soon!</p>
            </div>
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
