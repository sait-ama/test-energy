import { getTranslations } from 'next-intl/server';

import { captureException } from '@sentry/nextjs';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ErrorView } from '~features/error-view';
import { client } from '~shared/api/client';
import { v2TitlesCollectionsRetrieveOptions } from '~shared/api/generated/tanstack';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { getError } from '~shared/lib/form/error-handling-base';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';
import { UpdateCollection } from '~widgets/collections-form/ui/update-collection';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async ({ params }) => {
    const queryClient = getQueryClient();
    const { id } = await params;
    const t = await getTranslations('pages.collections.collections-edit');

    const collection = await queryClient.fetchQuery(
      v2TitlesCollectionsRetrieveOptions({
        client,
        path: { id: +id },
        cache: 'no-cache',
      })
    );
    const siteConfig = getSiteConfig()!;

    return {
      title: t('meta.title', { id: collection.id, name: collection.name }),
      description: t('meta.description', {
        id: collection.id,
        name: collection.name,
        siteName: siteConfig.site.name,
      }),
      index: false,
      follow: false,
    };
  }, 'collection-edit')
);

export default async ({ params }: NextPageParams<{ id: string }>) => {
  const queryClient = getQueryClient();
  const id = await params;

  try {
    await queryClient.prefetchQuery(
      v2TitlesCollectionsRetrieveOptions({
        client,
        path: { id: +id },
      })
    );
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UpdateCollection />
      </HydrationBoundary>
    );
  } catch (e: unknown) {
    const { statusCode, message } = getError(e);
    captureException(e, { level: 'error' });
    return (
      <Container>
        <ErrorView msg={message} status={statusCode} />
      </Container>
    );
  }
};

export const dynamic = 'force-dynamic';
