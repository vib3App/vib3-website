'use client';

import {
  BUILT_IN_TEMPLATES,
  type RecordingTemplate,
  type TemplateState,
  type TemplateSlot,
} from '@/hooks/camera/useTemplateRecording';

interface TemplateSelectorProps {
  templateState: TemplateState;
  selectedTemplate: RecordingTemplate | null;
  currentSlotIndex: number;
  currentSlot: TemplateSlot | null;
  slotTimeRemaining: number;
  completedSlots: number;
  onSelectTemplate: (template: RecordingTemplate) => void;
  onStartSlot: () => void;
  onAdvance: () => void;
  onRetake: () => void;
  onReset: () => void;
}

export function TemplateSelector({
  templateState, selectedTemplate, currentSlotIndex, currentSlot,
  slotTimeRemaining, completedSlots,
  onSelectTemplate, onStartSlot, onAdvance, onRetake, onReset,
}: TemplateSelectorProps) {
  // Template selection grid
  if (templateState === 'selecting') {
    return (
      <div className="absolute bottom-32 left-0 right-0 z-10 px-4">
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Choose Template</h3>
            <button
              onClick={onReset}
              className="text-white/50 text-xs hover:text-white"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BUILT_IN_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="bg-white/10 rounded-xl p-3 text-left hover:bg-white/20 transition-colors"
              >
                <div className="text-white text-sm font-medium mb-1">
                  {template.name}
                </div>
                <div className="text-white/50 text-xs mb-2">
                  {template.description}
                </div>
                <div className="flex gap-1">
                  {template.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex-1 h-1.5 bg-purple-500/40 rounded-full"
                      title={`${slot.label}: ${slot.duration}s`}
                    />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTemplate || !currentSlot) return null;

  // Active template recording UI
  return (
    <div className="absolute top-24 left-4 right-4 z-20">
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
        {/* Template name and progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-xs font-medium">
            {selectedTemplate.name}
          </span>
          <button
            onClick={onReset}
            className="text-white/40 text-xs hover:text-white"
          >
            Exit
          </button>
        </div>

        {/* Slot progress bars */}
        <div className="flex gap-1 mb-2">
          {selectedTemplate.slots.map((slot, i) => (
            <div
              key={slot.id}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i < currentSlotIndex
                  ? 'bg-green-500'
                  : i === currentSlotIndex
                    ? templateState === 'recording'
                      ? 'bg-red-500 animate-pulse'
                      : 'bg-purple-500'
                    : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Current slot info */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white text-sm font-semibold">
              {currentSlot.label}
            </span>
            <span className="text-white/50 text-xs ml-2">
              Slot {currentSlotIndex + 1}/{selectedTemplate.slots.length}
            </span>
          </div>

          {templateState === 'recording' && (
            <span className="text-red-400 font-mono text-sm">
              {slotTimeRemaining}s
            </span>
          )}

          {templateState === 'ready' && (
            <button
              onClick={onStartSlot}
              className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full"
            >
              Record {currentSlot.duration}s
            </button>
          )}

          {templateState === 'slot-complete' && (
            <div className="flex gap-2">
              <button
                onClick={onRetake}
                className="px-3 py-1 bg-white/20 text-white text-xs rounded-full"
              >
                Retake
              </button>
              <button
                onClick={onAdvance}
                className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full"
              >
                Next
              </button>
            </div>
          )}

          {templateState === 'all-complete' && (
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-xs">
                {completedSlots}/{selectedTemplate.slots.length} done
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
