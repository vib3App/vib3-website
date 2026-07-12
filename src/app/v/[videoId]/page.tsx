import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vib3app.net';

interface VideoData {
  _id: string;
  caption?: string;
  author?: {
    username?: string;
    displayName?: string;
    profileImage?: string;
  };
  media?: Array<{
    url?: string;
    thumbnailUrl?: string;
    type?: string;
  }>;
  viewsCount?: number;
  likesCount?: number;
  commentsCount?: number;
}

async function fetchVideo(videoId: string): Promise<VideoData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/videos/${videoId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ videoId: string }>;
}): Promise<Metadata> {
  const { videoId } = await params;
  const video = await fetchVideo(videoId);

  if (!video) {
    return { title: 'VIB3 - Video Not Found' };
  }

  const username = video.author?.username || '';
  const displayName = video.author?.displayName || username || 'VIB3';
  const caption = (video.caption || '').trim();

  // Match the clean card layout apps like TikTok use. iMessage/LinkPresentation
  // renders the card as "<og:site_name> · <og:title>" (e.g. "VIB3 · Heart Adopts")
  // with og:description as the subtitle. So: title = the CREATOR's name, and the
  // subtitle is the caption when we have one, else a simple call-to-action (like
  // TikTok's "Watch TikTok now"). No stats clutter — TikTok doesn't show them.
  const ogTitle = displayName;
  const ogDescription = caption || 'Watch on VIB3';

  const pageTitle = `${displayName} on VIB3`;

  // Use the video's real CDN thumbnail as og:image (static + fast, like TikTok).
  // The previous og:image was a dynamically-generated 1200x630 PNG (~800KB, ~1.5s
  // to build), so iOS's LinkPresentation fetcher timed out and rendered NO preview
  // card at all. A static CDN JPEG loads in <200ms. Also expose the MP4 as og:video
  // (so the card shows a play button like TikTok) and og:url (canonical link).
  const media = video.media?.[0];
  const thumbnailUrl = media?.thumbnailUrl || undefined;
  const hls = media?.url || '';
  const mp4Url = hls.includes('/playlist.m3u8')
    ? hls.replace('/playlist.m3u8', '/play_720p.mp4')
    : undefined;
  const pageUrl = `https://vib3app.net/v/${videoId}`;

  return {
    title: pageTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: pageUrl,
      type: 'video.other',
      siteName: 'VIB3',
      images: thumbnailUrl ? [{ url: thumbnailUrl, alt: ogTitle }] : undefined,
      videos: mp4Url
        ? [{ url: mp4Url, secureUrl: mp4Url, type: 'video/mp4' }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: thumbnailUrl ? [thumbnailUrl] : undefined,
    },
    other: {
      'al:ios:app_store_id': '6744942498',
      'al:ios:app_name': 'VIB3',
      'al:ios:url': `vib3://video/${videoId}`,
      'al:android:package': 'com.vib3.vib3',
      'al:android:app_name': 'VIB3',
      'al:android:url': `vib3://video/${videoId}`,
    },
  };
}

export default async function ShortVideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await fetchVideo(videoId);

  const thumbnailUrl = video?.media?.[0]?.thumbnailUrl || null;
  const description = video?.caption || '';
  const username = video?.author?.username || '';
  const deepLink = `vib3://video/${videoId}`;
  const webFallback = `/video/${videoId}`;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">
      <div className="flex flex-col items-center max-w-sm w-full">
        {/* Thumbnail */}
        {thumbnailUrl && (
          <div className="relative w-full rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: '9/16', maxHeight: '50vh' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={description || 'VIB3 video'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-0 h-0 ml-1" style={{ borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderLeft: '24px solid black' }} />
              </div>
            </div>
          </div>
        )}

        {username && (
          <p className="text-lg font-semibold mb-1">@{username}</p>
        )}
        {description && (
          <p className="text-sm text-white/60 text-center mb-8 line-clamp-3">{description}</p>
        )}

        <a
          href={deepLink}
          className="block w-full py-4 rounded-xl text-center font-semibold text-white mb-3"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
        >
          Open in VIB3
        </a>

        <a
          href={webFallback}
          className="block w-full py-4 rounded-xl text-center font-semibold text-white border border-white/20 mb-8"
        >
          Watch on Web
        </a>

        <div className="flex gap-6 text-xs text-white/40">
          <a href="https://apps.apple.com/app/id6744942498" className="underline">App Store</a>
          <a href="https://play.google.com/store/apps/details?id=com.vib3.vib3" className="underline">Google Play</a>
        </div>
      </div>
    </div>
  );
}
