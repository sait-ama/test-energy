import type { NextConfig } from 'next';

export const headers: NextConfig['headers'] = async () => [
  {
    source: '/:path*',
    headers: [
      {
        key: 'Document-Policy',
        value: 'js-profiling',
      },
    ],
  },
  {
    source: '/:path*{/}?',
    headers: [
      {
        key: 'X-Accel-Buffering',
        value: 'no',
      },
    ],
  },
];
