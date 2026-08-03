import type { ImageConfig } from 'next/dist/shared/lib/image-config';

export const images: ImageConfig = {
  unoptimized: true,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**',
    },
    {
      protocol: 'http',
      hostname: '**',
    },
  ],
};
