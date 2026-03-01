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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          position: 'relative',
        }}
      >
        {/* Thumbnail - left/center area */}
        {thumbnailUrl && (
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              left: 40,
              top: 30,
              bottom: 30,
              width: 320,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt=""
              width={320}
              height={570}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />
          </div>
        )}

        {/* Content - right side */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'absolute',
            left: thumbnailUrl ? 400 : 60,
            right: 50,
            top: 0,
            bottom: 0,
            padding: '40px 0',
          }}
        >
          {/* VIB3 branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: 14,
                width: 52,
                height: 52,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  color: 'white',
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: -1,
                }}
              >
                V3
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                color: '#ffffff',
                fontSize: 32,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              VIB3
            </div>
          </div>

          {/* Username */}
          {username && (
            <div
              style={{
                display: 'flex',
                color: '#a78bfa',
                fontSize: 28,
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              @{username}
            </div>
          )}

          {/* Caption */}
          {caption && (
            <div
              style={{
                display: 'flex',
                color: '#e2e8f0',
                fontSize: 24,
                lineHeight: 1.4,
                marginBottom: 20,
                maxHeight: 170,
                overflow: 'hidden',
              }}
            >
              {caption.length > 120 ? caption.slice(0, 120) + '...' : caption}
            </div>
          )}

          {/* Stats */}
          {statsText && (
            <div
              style={{
                display: 'flex',
                color: '#94a3b8',
                fontSize: 20,
                marginBottom: 20,
              }}
            >
              {statsText}
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                borderRadius: 12,
                padding: '12px 28px',
                color: 'white',
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              Watch on VIB3
            </div>
          </div>
        </div>

        {/* Subtle gradient overlay on bottom */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
