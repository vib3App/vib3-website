import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '0.1.0',
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().split('T')[0],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vib3.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.b-cdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.vib3app.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.sc-cdn.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
