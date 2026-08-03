import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSimilarTitlesInfiniteKey, getTitleDetailKey } from '~entities/title/model/queries';
import { SimilarPage } from '~pages/(title)/similar-list/similar-page';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { isRussianRegExp } from '~shared/lib/regexp/is-russian';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string; chapter: string }>(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const queryClient = getQueryClient();
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`pages.title-similar.meta.${siteConfig.contentType}`);

    const [titleDetails, similarTitlesData] = await Promise.all([
      queryClient.fetchQuery(
        getTitleDetailKey({
          variables: { params: { dir: params.dir } },
          fetchOptions: { cache: 'no-cache' },
        })
      ),
      queryClient.fetchInfiniteQuery(
        getSimilarTitlesInfiniteKey({ variables: { params }, fetchOptions: { cache: 'no-cache' } })
      ),
    ]);

    const similarTitles = similarTitlesData?.pages
      .flatMap((it) => it.results)
      .map((it) => it.title.main_name)
      .slice(0, 8)
      .sort((a, b) => Number(isRussianRegExp(a)) - Number(isRussianRegExp(b)))
      .join(', ');

    const title = t('title', { name: titleDetails.main_name });

    const description = t('description', { name: titleDetails.main_name, similarTitles });

    return generateNextMetadata({
      title,
      description,
      canonical: Routing.Title.similar({
        params: { dir: params.dir, content: siteConfig.contentType },
      }),
    });
  }, 'title-similar')
);

export default async function Similar(props: NextPageParams<{ dir: string }>) {
  const params = await props.params;
  const queryClient = getQueryClient();

  const prefetches = [
    queryClient.prefetchInfiniteQuery(
      getSimilarTitlesInfiniteKey({
        variables: {
          params,
        },
      })
    ),
    queryClient.prefetchQuery(
      getTitleDetailKey({
        variables: {
          params,
        },
      })
    ),
  ];

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Container slim className="mt-2">
        <Suspense>
          <SimilarPage />
        </Suspense>
      </Container>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
