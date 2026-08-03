import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { MomentsFeedPage } from '~pages/(shorts)/moments-feed/ui/moments-feed';
import { Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';
import { NoSSR } from '~shared/ui/no-ssr';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`pages.moment-shorts.meta.${siteConfig.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', {
        siteName: siteConfig.site.name,
      }),
      canonical: Routing.Moment.shorts(),
      og: {
        alt: t('title'),
      },
    });
  }, 'moments-shorts')
);

export default async function Shorts() {
  const siteConfig = getSiteConfig()!;

  if (!siteConfig.features[Features.SHORTS]) notFound();

  return (
    <Container layout="tiny" className="relative px-0">
      <NoSSR>
        <MomentsFeedPage />
      </NoSSR>
    </Container>
  );
}
