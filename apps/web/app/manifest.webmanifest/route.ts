import { NextResponse } from 'next/server';

import { getSiteConfig } from '~shared/config/site-config';

export const GET = () => {
  const config = getSiteConfig()!;

  const manifest = {
    name: config.site.name,
    short_name: config.site.name,
    description: config.site.description ?? 'Лучший веб-сайт по чтению комиксов в рунете',
    lang: config.localization.localeCode,
    start_url: '/',
    display: 'standalone',
    background_color: config.theme.backgroundColor,
    theme_color: config.theme.backgroundColor,
    icons: [
      {
        src: './icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: './icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return NextResponse.json(manifest);
};

export const revalidate = 3600;
export const dynamic = 'force-dynamic';
