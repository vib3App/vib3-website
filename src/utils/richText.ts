/**
 * Parse free text into segments, tagging @mentions, #hashtags, and URLs so they
 * can be rendered as tappable links. Pure (no React) so it's unit-testable.
 *
 * - mention: `@name` not preceded by a word char or `@` (avoids emails)
 * - hashtag: `#tag` not preceded by a word char or `#`
 * - url: http(s) link
 */

export type RichSegment =
  | { type: 'text'; value: string }
  | { type: 'mention'; value: string; name: string }
  | { type: 'hashtag'; value: string; tag: string }
  | { type: 'url'; value: string };

const TOKEN = /(https?:\/\/[^\s]+)|(?<![\w@])@([a-zA-Z0-9_.]{2,30})|(?<![\w#])#([a-zA-Z0-9_]{1,50})/g;

export function parseRichText(text: string): RichSegment[] {
  if (!text) return [];
  const segments: RichSegment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: 'text', value: text.slice(last, m.index) });
    const [full, url, mention, hashtag] = m;
    if (url) {
      // Trim trailing punctuation that's likely sentence punctuation, not URL.
      const trimmed = url.replace(/[.,!?;:)]+$/, '');
      segments.push({ type: 'url', value: trimmed });
      last = m.index + trimmed.length;
    } else if (mention !== undefined) {
      segments.push({ type: 'mention', value: full, name: mention });
      last = m.index + full.length;
    } else if (hashtag !== undefined) {
      segments.push({ type: 'hashtag', value: full, tag: hashtag });
      last = m.index + full.length;
    } else {
      last = m.index + full.length;
    }
  }
  if (last < text.length) segments.push({ type: 'text', value: text.slice(last) });
  return segments;
}
