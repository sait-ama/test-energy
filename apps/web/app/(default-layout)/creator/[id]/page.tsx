import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import querystring from 'querystring';

import { getCreatorKey } from '~entities/creator/model/queries';
import { getTitlesByQueryInfiniteKey } from '~entities/title/model/queries';
import { getUserBookmarksTypesKey } from '~entities/user/model/queries';
import { getTransformedValues } from '~features/title-filters/model/lib';
import { CreatorDetailBreadcrumbsLd } from '~pages/(creator)/creator-detail-page/seo/ld';
import { CreatorPage } from '~pages/(creator)/creator-detail-page/ui/creator-page';
import { FormsTypes } from '~shared/api/models/forms';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { getLogged } from '~shared/lib/session/get-logged';
import { getSession } from '~shared/lib/session/get-session';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { fallbackEmpty as _ } from '~shared/seo/fallback-empty';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }, Record<string, string>>(
  withMetadataCache(async (props) => {
    const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
    const siteConfig = getSiteConfig()!;
    const t = await getTranslations(`pages.creator-page.meta.${siteConfig.contentType}`);
    const queryClient = getQueryClient();
    const query = {
      creators: [params.id],
      ...getTransformedValues(querystring.stringify(searchParams)),
    };

    const prefetches = [
      queryClient.fetchQuery(
        getCreatorKey({
          variables: {
            params: {
              id: params.id,
            },
          },
          fetchOptions: { cache: 'force-cache', next: { revalidate: 60 * 60 } },
        })
      ),
      queryClient.fetchInfiniteQuery(
        getTitlesByQueryInfiniteKey({
          variables: { query },
          fetchOptions: { cache: 'force-cache', next: { revalidate: 60 * 60 } },
        })
      ),
    ];

    const [creator, titles] = await Promise.all(prefetches).then(([creator, titles]) => [
      creator,
      titles?.pages[0].results,
    ]);

    return generateNextMetadata({
      title: t('title', {
        type: creator.type.name,
        name: creator.name,
        country: creator.country.name,
      }),
      description: t('description', {
        type: creator.type.name,
        name: creator.name,
        country: creator.country.name,
        alt_name: _(creator.alt_name),
        description: _((creator.description ?? '').replace(htmlRegExp, '')),
        titles: titles.map((it) => it.main_name).join(', '),
        siteName: siteConfig.site.name,
      }),
      canonical: Routing.Creator.detail({ params: { id: params.id } }),
    });
  }, 'creator-detailed')
);

export default async function Creator(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<string>;
}) {
  const [params, searchParams] = await Promise.all([props.params, props.searchParams]);
  const queryClient = getQueryClient();
  const logged = await getLogged();
  const session = await getSession();

  const query = {
    creators: [params.id],
    ...getTransformedValues(searchParams),
  };

  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery(
      getCreatorKey({
        variables: {
          params: {
            id: params.id,
          },
        },
      })
    ),
    queryClient.prefetchQuery(
      getTypesBaseKey({
        get: ['status', 'categories', 'genres', 'types', 'age_limit', 'translate_status'],
        type: FormsTypes.TITLES,
      })
    ),
    queryClient.prefetchInfiniteQuery(getTitlesByQueryInfiniteKey({ variables: { query } })),
  ];

  if (logged) {
    prefetches.push(
      queryClient.prefetchQuery(
        getUserBookmarksTypesKey({ variables: { params: { userId: session!.id } } })
      )
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <CreatorDetailBreadcrumbsLd id={params.id} />
      <CreatorPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
