import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { CollectionProvider } from '~pages/(collection)/collection-detail-page/model/store';
import { CollectionPage } from '~pages/(collection)/collection-detail-page/ui/collection-page';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsRetrieveOptions } from '~shared/api/generated/tanstack';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { fallbackEmpty as _ } from '~shared/seo/fallback-empty';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async ({ params }) => {
    const { id } = await params;
    const queryClient = getQueryClient();
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(
      `pages.collections.collection-page.meta.${siteConfig.contentType}`
    );

    const collection = await queryClient.fetchQuery(
      v2TitlesCollectionsRetrieveOptions({
        client,
        path: { id: +id },
        cache: 'no-cache',
      })
    );

    return generateNextMetadata({
      title: t('title', {
        name: collection.name,
        userName: _(collection.user?.username),
        id: collection.id,
      }),
      description: t('description', {
        id: collection.id,
        name: collection.name,
        userName: _(collection.user?.username),
        titles: collection.titles.map((it) => it.main_name).join(', '),
        siteName: siteConfig.site.name,
      }),
      canonical: Routing.Collection.getByID({ params: { id } }),
    });
  }, 'collection-detailed')
);

export default async function CollectionPageAsync(props: NextPageParams<{ id: string }>) {
  const { id } = await props.params;
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(
    v2TitlesCollectionsRetrieveOptions({
      client,
      path: { id: +id },
    })
  );
  return (
    <Container slim className="px-2">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CollectionProvider>
          <CollectionPage />
        </CollectionProvider>
      </HydrationBoundary>
    </Container>
  );
}

export const dynamic = 'force-dynamic';
