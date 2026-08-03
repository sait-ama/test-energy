import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { PublisherRepository } from '~entities/publisher/model/repository';
import { TitlePromoListPage } from '~pages/(publisher)/title-promo-list/ui/title-promo-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-ad-page.meta');

    const siteConfig = getSiteConfig()!;
    const { content: publisher } = await PublisherRepository.getPublisherByDir(
      { params: { dir: dir } },
      { cache: 'force-cache', next: { revalidate: 60 * 60 * 4 } }
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, typeId: publisher.type.id }),
      description: t('description', {
        siteName: siteConfig.site.name,
        typeId: publisher.type.id,
        name: publisher.name,
      }),
      canonical: Routing.Publisher.detail({ params: { dir, tab: 'advertisement' } }),
      index: false,
      follow: false,
    });
  }, 'publisher-advertisement')
);

export default async function Advertisement() {
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TitlePromoListPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
