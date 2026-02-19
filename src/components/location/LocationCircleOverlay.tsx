'use client';

interface LocationCircleOverlayProps {
  color: string;
  name: string;
  memberCount: number;
}

export function LocationCircleOverlay({ color, name, memberCount }: LocationCircleOverlayProps) {
  return (
    <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-white text-xs font-medium">{name}</span>
      <span className="text-white/30 text-xs">{memberCount}</span>
    </div>
  );
}
