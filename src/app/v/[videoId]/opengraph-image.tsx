import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VIB3 Video';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.vib3app.net';

interface VideoData {
  caption?: string;
  author?: { username?: string };
  media?: Array<{ thumbnailUrl?: string }>;
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
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

export default async function Image({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await fetchVideo(videoId);

  const thumbnailUrl = video?.media?.[0]?.thumbnailUrl || null;
  const username = video?.author?.username || '';
  const caption = video?.caption || '';
  const likes = video?.likesCount || 0;
  const comments = video?.commentsCount || 0;

  const statsText =
    likes > 0 || comments > 0
      ? `${likes.toLocaleString()} likes · ${comments.toLocaleString()} comments`
      : '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: '#0a0a0a',
        }}
      >
        {/* Thumbnail fills entire card */}
        {thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        )}

        {/* Bottom gradient overlay for text readability */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 280,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
          }}
        />

        {/* Bottom content overlay */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '0 40px 36px 40px',
          }}
        >
          {/* Caption */}
          {caption && (
            <div
              style={{
                display: 'flex',
                color: '#e2e8f0',
                fontSize: 28,
                lineHeight: 1.3,
                marginBottom: 16,
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {caption.length > 100 ? caption.slice(0, 100) + '...' : caption}
            </div>
          )}

          {/* Stats */}
          {statsText && (
            <div
              style={{
                display: 'flex',
                color: '#cbd5e1',
                fontSize: 22,
                marginBottom: 16,
                textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              }}
            >
              {statsText}
            </div>
          )}

          {/* Username + VIB3 branding row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {/* Username */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {username && (
                <div
                  style={{
                    display: 'flex',
                    color: '#ffffff',
                    fontSize: 26,
                    fontWeight: 700,
                    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                  }}
                >
                  @{username}
                </div>
              )}
            </div>

            {/* VIB3 logo pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: 20,
                padding: '8px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                VIB3
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
