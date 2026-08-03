import { forbidden } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

// import { BOOKMARK_ORDERING_DEFAULT } from '~entities/bookmarks/model/const';
import { getUserBookmarksTypesKey } from '~entities/user/model/queries';
import { Bookmarks } from '~pages/(user)/bookmarks/ui/bookmarks';
import { getQueryClient } from '~shared/api/react-query';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-private-bookmarks.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      follow: false,
      index: false,
    });
  }, 'bookmarks')
);

export default async function UserBookmarksPage(
  _: NextPageParams<null, { type: string; ordering: string }>
) {
  // const searchParams = await props.searchParams;
  // const { type = '1' /*, ordering = BOOKMARK_ORDERING_DEFAULT*/ } = searchParams;

  const queryClient = getQueryClient();
  const session = (await getSession())!;

  if (!session) forbidden();

  // const bookmarkId = type === 'all' ? undefined : type;

  const prefetches: Promise<void>[] = [
    // queryClient.prefetchInfiniteQuery(
    //   getUserBookmarksQuery({
    //     variables: {
    //       params: {
    //         userId: session.id,
    //       },
    //       query: {
    //         type: bookmarkId,
    //         ordering,
    //       },
    //     },
    //   })
    // ),
    queryClient.prefetchQuery(
      getUserBookmarksTypesKey({
        variables: {
          params: {
            userId: session.id,
          },
        },
      })
    ),
  ];

  await Promise.allSettled(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Bookmarks />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
