'use client';

interface LocationMessageBubbleProps {
  lat: number;
  lng: number;
  address?: string;
  isOwn: boolean;
}

export function LocationMessageBubble({ lat, lng, address, isOwn }: LocationMessageBubbleProps) {
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
  const staticMapUrl = `https://staticmap.thistle.workers.dev/?center=${lat},${lng}&zoom=15&size=250x150&markers=${lat},${lng}`;

  return (
    <div className={`rounded-2xl overflow-hidden max-w-[260px] ${isOwn ? 'bg-purple-500' : 'glass'}`}>
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="block">
        <div className="w-[250px] h-[120px] bg-white/5 relative flex items-center justify-center">
          <img
            src={staticMapUrl}
            alt="Location map"
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-red-500/80 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </a>

      <div className="px-3 py-2">
        <p className="text-white text-sm font-medium flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{address || 'Shared Location'}</span>
        </p>
        <p className="text-white/50 text-xs mt-0.5">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-1 text-xs text-purple-300 hover:text-purple-200"
        >
          Open in Maps
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
