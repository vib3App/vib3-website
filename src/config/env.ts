/**
 * Environment configuration
 * Centralized config prevents scattered env access
 */
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://vib3-backend-2hgsm.ondigitalocean.app/api',
    timeout: 30000,
  },
  cdn: {
    baseUrl: process.env.NEXT_PUBLIC_CDN_URL || 'https://vib3-cdn.b-cdn.net',
  },
  app: {
    name: 'VIB3',
    version: '1.0.0',
  },
} as const;
