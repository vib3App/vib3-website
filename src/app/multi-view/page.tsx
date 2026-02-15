'use client';

import Image from 'next/image';
import { Suspense } from 'react';
import { useMultiView } from '@/hooks/useMultiView';
import { MultiViewHeader, VideoSlotCard, AddVideoModal } from '@/components/multi-view';

function MultiViewLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function MultiViewContent() {
  const mv = useMultiView();

  return (
    <div className="min-h-screen bg-black text-white">
      <MultiViewHeader
        slots={mv.slots}
        layoutMode={mv.layoutMode}
        masterMuted={mv.masterMuted}
        onLayoutChange={mv.setLayoutMode}
        onMasterMuteToggle={() => mv.toggleMute()}
        onPlayAll={mv.playAll}
        onPauseAll={mv.pauseAll}
      />

      <main className={`grid ${mv.getLayoutClasses()} gap-1 h-[calc(100vh-3.5rem)]`}>
        {mv.slots.map((slot, index) => (
          <VideoSlotCard
            key={slot.id}
            slot={slot}
            index={index}
            layoutMode={mv.layoutMode}
            focusedSlot={mv.focusedSlot}
            videoRef={el => { mv.videoRefs.current[index] = el; }}
            onTogglePlay={() => mv.togglePlay(index)}
            onToggleMute={() => mv.toggleMute(index)}
            onRemove={() => mv.removeVideoFromSlot(index)}
            onFocus={() => { mv.setFocusedSlot(index); mv.setLayoutMode('focus'); }}
            onAddClick={() => mv.setShowAddModal(true)}
          />
        ))}
      </main>

      {mv.layoutMode === 'focus' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/80 rounded-full">
          {mv.slots.map((slot, i) => (
            <button
              key={slot.id}
              onClick={() => mv.setFocusedSlot(i)}
              disabled={!slot.video}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                i === mv.focusedSlot ? 'border-pink-500' : 'border-transparent'
              } ${!slot.video ? 'opacity-50' : ''}`}
            >
              {slot.video?.thumbnailUrl ? (
                <Image src={slot.video.thumbnailUrl} alt={(slot.video.title || slot.video.caption || "Video") + " thumbnail"} width={48} height={48} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <span className="text-xs">{i + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <AddVideoModal
        isOpen={mv.showAddModal}
        searchQuery={mv.searchQuery}
        searchResults={mv.searchResults}
        searching={mv.searching}
        onClose={mv.closeAddModal}
        onSearchChange={mv.setSearchQuery}
        onSearch={mv.handleSearch}
        onAddVideo={(video) => mv.addVideoToSlot(video, mv.getEmptySlotIndex())}
      />
    </div>
  );
}

export default function MultiViewPage() {
  return (
    <Suspense fallback={<MultiViewLoading />}>
      <MultiViewContent />
    </Suspense>
  );
}
