import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import {
  getSuspenseUserQuery,
  getUserBookmarksQuery,
  getUserBookmarksTypesKey,
} from '~entities/user/model/queries';
import { BookmarksPage } from '~pages/(user)/bookmarks-tab/ui/bookmarks';
import { UserDetailBreadcrumbsLd } from '~pages/(user)/ld';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('pages.user-bookmarks.meta');
    const queryClient = getQueryClient();

    const userPrefetch = queryClient.fetchQuery(
      getSuspenseUserQuery({
        variables: { params: { userId: id } },
        fetchOptions: {
          cache: 'no-cache',
        },
      })
    );

    const bookmarksPrefetch = queryClient
      .fetchInfiniteQuery(
        getUserBookmarksQuery({
          variables: {
            params: {
              userId: id,
            },
            query: {
              type: '1',
              page: 1,
              count: 3,
            },
          },
          fetchOptions: {
            cache: 'no-cache',
          },
        })
      )
      .then((v) => v.pages.flatMap((it) => it.results));

    const [user, bookmarks] = await Promise.all([userPrefetch, bookmarksPrefetch]);

    const username = user.username;

    return generateNextMetadata({
      title: t('title', { username }),
      description: t('description', {
        username,
        bookmarks: bookmarks.map((it) => it.title.main_name).join(', '),
      }),
      canonical: Routing.User.detail({ params: { id, tab: 'bookmarks' } }),
    });
  }, 'user-bookmarks')
);

export default async function Bookmarks(
  props: NextPageParams<
    { id: string },
    {
      bookmarkId: string;
    }
  >
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { id } = params;
  const bookmarkId = parseInt(searchParams.bookmarkId ?? '1');

  const queryClient = getQueryClient();

  await Promise.allSettled([
    queryClient.prefetchQuery(
      getUserBookmarksTypesKey({
        variables: {
          params: {
            userId: id,
          },
        },
      })
    ),
    queryClient.prefetchInfiniteQuery(
      getUserBookmarksQuery({
        variables: {
          params: {
            userId: id,
          },
          query: {
            type: bookmarkId,
          },
        },
      })
    ),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetailBreadcrumbsLd tab="bookmarks" />
      <BookmarksPage />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
