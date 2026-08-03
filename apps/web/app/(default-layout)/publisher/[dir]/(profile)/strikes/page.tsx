import { getTranslations } from 'next-intl/server';

import { captureException } from '@sentry/nextjs';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherQuery, getStrikesQuery } from '~entities/publisher/model/queries';
import { PublisherRepository } from '~entities/publisher/model/repository';
import { ErrorView } from '~features/error-view';
import { StrikesTable } from '~pages/(publisher)/strikes/strikes-table/strikes-table';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { getError } from '~shared/lib/form/error-handling-base';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';
import { EntityLayoutContent } from '~shared/ui/entity-layout';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-strikes-page.meta');

    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();

    const { content: publisher } = await queryClient.fetchQuery(
      getPublisherQuery({
        variables: { params: { dir } },
        fetchOptions: { cache: 'force-cache', next: { revalidate: 60 * 60 } },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: publisher.name, id: publisher.id, typeId: publisher.type.id }),
      description: t('description', {
        siteName: siteConfig.site.name,
        name: publisher.name,
        typeId: publisher.type.id,
      }),
      index: false,
      follow: false,
    });
  }, 'publisher-strikes')
);

export default async function Strikes(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  const queryClient = getQueryClient();
  const publisherData = await PublisherRepository.getPublisherByDir({ params });
  const publisher = publisherData.content;

  try {
    const prefetches = [
      await queryClient.prefetchQuery(
        getStrikesQuery({
          variables: { params: { publisherId: publisher.id } },
        })
      ),
    ];
    await Promise.all(prefetches);

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EntityLayoutContent>
          <StrikesTable />
        </EntityLayoutContent>
      </HydrationBoundary>
    );
  } catch (e: unknown) {
    captureException(e);
    const data = getError(e as Error);

    return (
      <Container slim className="flex-1 px-2">
        <ErrorView
          msg={data.message}
          status={data.statusCode}
          className="flex min-h-screen items-center justify-center"
        />
      </Container>
    );
  }
}

export const dynamic = 'force-dynamic';
