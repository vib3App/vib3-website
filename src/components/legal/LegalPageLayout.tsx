import type { ReactNode } from 'react';

interface LegalPageLayoutProps {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  summary?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function LegalPageLayout({ title, effectiveDate, lastUpdated, summary, footer, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-invert prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
          <p className="text-neutral-400 mb-8">
            <strong>Effective Date:</strong> {effectiveDate} | <strong>Last Updated:</strong> {lastUpdated}
          </p>

          <hr className="border-neutral-800 my-8" />

          {summary}

          {children}

          {footer && (
            <>
              <hr className="border-neutral-800 my-8" />
              {footer}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
