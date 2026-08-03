import type { Rewrite } from 'next/dist/lib/load-custom-routes';

export const rewrites = async (): Promise<Rewrite[]> => {
  const duckBackend = process.env.DUCK_BACKEND_URL || 'http://localhost:8000';
  return [
    {
      source: '/api/state',
      destination: `${duckBackend}/api/state`,
    },
    {
      source: '/api/scan_now',
      destination: `${duckBackend}/api/scan_now`,
    },
    {
      source: '/api/toggle_avatar',
      destination: `${duckBackend}/api/toggle_avatar`,
    },
    {
      source: '/api/toggle_prize_sent',
      destination: `${duckBackend}/api/toggle_prize_sent`,
    },
    {
      source: '/api/target_posts/:path*',
      destination: `${duckBackend}/api/target_posts/:path*`,
    },
  ] satisfies Rewrite[];
};
