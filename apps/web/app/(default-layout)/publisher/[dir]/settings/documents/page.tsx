import { getTranslations } from 'next-intl/server';

import { captureException } from '@sentry/nextjs';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherActsKey, getPublisherQuery } from '~entities/publisher/model/queries';
import { ErrorView } from '~features/error-view';
import { PublisherActs } from '~pages/(publisher)/(settings)/publisher-acts';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { getError } from '~shared/lib/form/error-handling-base';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-documents-page.meta');

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
        id: publisher.id,
        typeId: publisher.type.id,
      }),
      index: false,
      follow: false,
    });
  }, 'publisher-documents')
);

const DocumentsPage = async (props: NextPageParams<{ dir: string }>) => {
  const params = await props.params;

  const { dir } = params;

  const queryClient = getQueryClient();
  try {
    const publisher = await queryClient.fetchQuery(
      getPublisherQuery({ variables: { params: { dir } } })
    );
    if (publisher.content.contract_id) {
      await queryClient.prefetchQuery(
        getPublisherActsKey({
          variables: { params: { contractId: publisher.content.contract_id } },
        })
      );
    }

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <PublisherActs />
      </HydrationBoundary>
    );
  } catch (e: unknown) {
    captureException(e);
    const data = getError(e);

    return (
      <Container slim className="flex-1 px-2">
        <ErrorView
          withImage
          msg={data.message}
          status={data.statusCode}
          className="flex min-h-screen items-center justify-center"
        />
      </Container>
    );
  }
};

export default DocumentsPage;

export const dynamic = 'force-dynamic';
