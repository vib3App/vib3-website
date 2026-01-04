import type { ReactNode } from 'react';

interface LegalSectionProps {
  title: string;
  children: ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="text-neutral-300 space-y-4">{children}</div>
    </section>
  );
}

interface SubSectionProps {
  title: string;
  children?: ReactNode;
}

export function SubSection({ title, children }: SubSectionProps) {
  return (
    <>
      <h3 className="text-xl font-semibold text-white mt-6">{title}</h3>
      {children}
    </>
  );
}

interface HighlightBoxProps {
  variant?: 'default' | 'warning';
  children: ReactNode;
}

export function HighlightBox({ variant = 'default', children }: HighlightBoxProps) {
  const styles = variant === 'warning'
    ? 'bg-red-900/20 border border-red-500/30'
    : 'bg-neutral-900';

  return <div className={`${styles} p-6 rounded-lg`}>{children}</div>;
}

interface BulletListProps {
  items: string[];
}

export function BulletList({ items }: BulletListProps) {
  return (
    <ul>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

interface CategoryLabelProps {
  children: ReactNode;
}

export function CategoryLabel({ children }: CategoryLabelProps) {
  return <p className="font-semibold text-red-400 mt-4">{children}</p>;
}
