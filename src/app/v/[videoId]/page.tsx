import { Metadata } from 'next';
import { redirect } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vib3app.net';
const CDN_BASE = 'https://vz-e2b42522-447.b-cdn.net';

interface VideoData {
  _id: string;
  description?: string;
  caption?: string;
  username?: string;
  bunnyStreamVideoId?: string;
  thumbnailUrl?: string;
  viewsCount?: number;
  likesCount?: number;
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
    return {
      title: 'VIB3 - Video Not Found',
      description: 'This video may have been removed or is no longer available.',
    };
  }

  const title = video.username
    ? `${video.username} on VIB3`
    : 'VIB3';
  const description = video.description || video.caption || 'Watch this on VIB3';
  const thumbnailUrl = video.thumbnailUrl
    || (video.bunnyStreamVideoId
      ? `${CDN_BASE}/${video.bunnyStreamVideoId}/thumbnail.jpg`
      : undefined);
  const videoUrl = video.bunnyStreamVideoId
    ? `${CDN_BASE}/${video.bunnyStreamVideoId}/playlist.m3u8`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      siteName: 'VIB3',
      ...(thumbnailUrl && {
        images: [
          {
            url: thumbnailUrl,
            width: 720,
            height: 1280,
            alt: description,
          },
        ],
      }),
      ...(videoUrl && {
        videos: [
          {
            url: videoUrl,
            width: 720,
            height: 1280,
            type: 'application/x-mpegURL',
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
  redirect(`/video/${videoId}`);
}
