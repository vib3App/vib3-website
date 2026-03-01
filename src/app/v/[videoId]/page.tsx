import { Metadata } from 'next';

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
  const video = await fetchVideo(videoId);

  const thumbnailUrl = video?.thumbnailUrl
    || (video?.bunnyStreamVideoId
      ? `${CDN_BASE}/${video.bunnyStreamVideoId}/thumbnail.jpg`
      : null);
  const description = video?.description || video?.caption || '';
  const username = video?.username || '';
  const deepLink = `vib3://video/${videoId}`;
  const webFallback = `/video/${videoId}`;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, backgroundColor: '#000', color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        {/* Auto-redirect to app via custom scheme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var deepLink = "${deepLink}";
            var webFallback = "${webFallback}";
            var start = Date.now();

            // Try to open the app
            window.location.href = deepLink;

            // If we're still here after 1.5s, the app didn't open
            setTimeout(function() {
              if (Date.now() - start < 3000) {
                // Page is still visible = app didn't open
                // Show the content (it's already there, just reveal it)
                var el = document.getElementById('fallback');
                if (el) el.style.opacity = '1';
              }
            }, 1500);
          })();
        `}} />

        <div id="fallback" style={{ opacity: 0, transition: 'opacity 0.3s', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          {/* Thumbnail */}
          {thumbnailUrl && (
            <div style={{ position: 'relative', width: '100%', maxWidth: '360px', aspectRatio: '9/16', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
              <img
                src={thumbnailUrl}
                alt={description || 'VIB3 video'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Play button overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderLeft: '24px solid #000', marginLeft: '4px' }} />
                </div>
              </div>
            </div>
          )}

          {/* Info */}
          {username && (
            <p style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
              @{username}
            </p>
          )}
          {description && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '0 0 32px', textAlign: 'center', maxWidth: '360px' }}>
              {description.length > 120 ? description.slice(0, 120) + '...' : description}
            </p>
          )}

          {/* Open in app button */}
          <a
            href={deepLink}
            style={{ display: 'block', width: '100%', maxWidth: '320px', padding: '16px', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', marginBottom: '12px' }}
          >
            Open in VIB3
          </a>

          {/* Watch on web */}
          <a
            href={webFallback}
            style={{ display: 'block', width: '100%', maxWidth: '320px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', color: '#fff', fontSize: '16px', fontWeight: 600, textAlign: 'center', textDecoration: 'none', marginBottom: '24px' }}
          >
            Watch on Web
          </a>

          {/* Download links */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            <a href="https://apps.apple.com/app/id6744942498" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'underline' }}>
              App Store
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.vib3.vib3" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'underline' }}>
              Google Play
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
