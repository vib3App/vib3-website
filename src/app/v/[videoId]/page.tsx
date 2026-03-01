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
  const likes = video.likesCount || 0;
  const comments = video.commentsCount || 0;
  const caption = video.caption || '';
  const thumbnailUrl = video.media?.[0]?.thumbnailUrl;

  // Match TikTok's iMessage card pattern:
  // og:title = creator name (shown as "VIB3 · username" in card footer)
  // og:description = stats + caption (shown prominently below image)
  const ogTitle = username || 'VIB3';

  const parts: string[] = [];
  if (likes > 0 || comments > 0) {
    parts.push(`${likes.toLocaleString()} likes, ${comments.toLocaleString()} comments.`);
  }
  if (caption) {
    parts.push(caption);
  } else {
    parts.push(`Check out ${username ? `${username}'s` : 'this'} video.`);
  }
  const ogDescription = parts.join(' ');

  // Page <title> for browser tab
  const pageTitle = username ? `${username} on VIB3` : 'Watch on VIB3';

  return {
    title: pageTitle,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: 'video.other',
      siteName: 'VIB3',
      ...(thumbnailUrl && {
        images: [
          {
            url: thumbnailUrl,
            width: 720,
            height: 1280,
            alt: ogDescription,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(thumbnailUrl && { images: [thumbnailUrl] }),
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
