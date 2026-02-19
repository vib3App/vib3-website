'use client';

interface ReplyPreviewProps {
  senderUsername: string;
  content: string;
  onDismiss: () => void;
}

/** Shows the quoted message above the input when replying */
export function ReplyPreview({ senderUsername, content, onDismiss }: ReplyPreviewProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 glass rounded-xl border-l-2 border-purple-400">
      <div className="flex-1 min-w-0">
        <p className="text-purple-400 text-xs font-medium">Replying to {senderUsername}</p>
        <p className="text-white/50 text-xs truncate">{content}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-white/30 hover:text-white flex-shrink-0"
        aria-label="Cancel reply"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

interface QuotedMessageProps {
  senderUsername: string;
  content: string;
}

/** Shows a quoted message inside a MessageBubble */
export function QuotedMessage({ senderUsername, content }: QuotedMessageProps) {
  return (
    <div className="mb-1 px-2 py-1 rounded-lg bg-white/5 border-l-2 border-purple-400/50">
      <p className="text-purple-400/70 text-[10px] font-medium">{senderUsername}</p>
      <p className="text-white/40 text-xs truncate">{content}</p>
    </div>
  );
}
