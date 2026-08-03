import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getCreatorFormsKey, getCreatorKey } from '~entities/creator/model/queries';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { EditCreatorForm } from '~widgets/edit-creator/ui/edit-creator';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const queryClient = getQueryClient();
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`creator-edit-page.meta.${siteConfig.contentType}`);

    const creator = await queryClient.fetchQuery(
      getCreatorKey({
        variables: {
          params: {
            id: params.id,
          },
        },
        fetchOptions: {
          cache: 'force-cache',
          next: { revalidate: 60 * 60 },
        },
      })
    );

    return generateNextMetadata({
      title: t('title', { name: creator.name, country: creator.country.name }),
      description: t('description', {
        name: creator.name,
        country: creator.country.name,
        siteName: siteConfig.site.name,
      }),
      index: false,
      follow: false,
    });
  }, 'creator-edit')
);

export default async function Edit(props: NextPageParams<{ id: string }>) {
  const queryClient = getQueryClient();
  const params = await props.params;
  const { id } = params;

  await Promise.all([
    queryClient.fetchQuery(
      getCreatorKey({ variables: { params: { id } }, fetchOptions: { cache: 'no-cache' } })
    ),
    queryClient.fetchQuery(getCreatorFormsKey({ fetchOptions: { cache: 'no-cache' } })),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EditCreatorForm />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
