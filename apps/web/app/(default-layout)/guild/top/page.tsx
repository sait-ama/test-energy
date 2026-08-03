import { getTranslations } from 'next-intl/server';

import { GuildTopPage } from '~pages/(guild)/top/ui/guild-top';
import { GuildTopBreadcrumbsLd } from '~pages/(guild)/top/ui/guild-top-ld';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.guild-tops.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      canonical: Routing.Club.top(),
    });
  }, 'guild-top')
);

export default async () => {
  return (
    <>
      <GuildTopBreadcrumbsLd />
      <GuildTopPage />
    </>
  );
};

export const dynamic = 'force-dynamic';
