'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { parseRichText } from '@/utils/richText';

interface RichTextProps {
  text: string;
  className?: string;
}

/**
 * Renders text with @mentions, #hashtags, and URLs as tappable links.
 * Link clicks stop propagation so they don't trigger row/card handlers.
 */
export function RichText({ text, className }: RichTextProps) {
  const segments = parseRichText(text);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <p className={className}>
      {segments.map((seg, i) => {
        switch (seg.type) {
          case 'mention':
            return (
              <Link key={i} href={`/search?q=%40${seg.name}`} className="text-purple-400 hover:underline" onClick={stop}>
                {seg.value}
              </Link>
            );
          case 'hashtag':
            return (
              <Link key={i} href={`/hashtag/${seg.tag}`} className="text-purple-400 hover:underline" onClick={stop}>
                {seg.value}
              </Link>
            );
          case 'url':
            return (
              <a key={i} href={seg.value} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline" onClick={stop}>
                {seg.value}
              </a>
            );
          default:
            return <Fragment key={i}>{seg.value}</Fragment>;
        }
      })}
    </p>
  );
}
