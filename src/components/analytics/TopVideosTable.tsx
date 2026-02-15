'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { TopVideo } from '@/types/analytics';
import { formatNumber } from './analyticsUtils';

interface TopVideosTableProps {
  videos: TopVideo[];
}

export function TopVideosTable({ videos }: TopVideosTableProps) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4">Top Performing Videos</h2>
      <div className="glass-card overflow-hidden">
        {!videos || videos.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            No videos yet. Start creating to see your analytics!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-white/50 text-sm font-medium px-6 py-4">Video</th>
                  <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Views</th>
                  <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Likes</th>
                  <th className="text-right text-white/50 text-sm font-medium px-6 py-4">Comments</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video, index) => (
                  <tr key={video._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/video/${video._id}`} className="flex items-center gap-3 hover:opacity-80">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white/50 font-medium">
                          {index + 1}
                        </div>
                        {video.thumbnail && (
                          <Image src={video.thumbnail} alt="" width={48} height={48} className="w-12 h-12 rounded object-cover" />
                        )}
                        <span className="text-white line-clamp-1">{video.title}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right text-white/70">{formatNumber(video.views)}</td>
                    <td className="px-6 py-4 text-right text-white/70">{formatNumber(video.likes)}</td>
                    <td className="px-6 py-4 text-right text-white/70">{formatNumber(video.comments)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
