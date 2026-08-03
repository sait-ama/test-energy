import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getPublisherQuery } from '~entities/publisher/model/queries';
import { CreateContractorForm } from '~features/create-contractor-form/ui/create-contractor-form';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const { dir } = await props.params;
    const t = await getTranslations('publisher-contract-page.meta');

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
      canonical: Routing.Publisher.detail({ params: { dir, tab: 'contract' } }),
    });
  }, 'publisher-contract')
);

export default async function PublisherContract(props: NextPageParams<{ dir: string }, undefined>) {
  const params = await props.params;
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(getPublisherQuery({ variables: { params } }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container>
        <CreateContractorForm />
      </Container>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
