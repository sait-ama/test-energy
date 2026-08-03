import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSuspenseFriendsRequestsPaginatedListQuery } from '~entities/friend/model/queries';
import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { FriendsRequestsList } from '~pages/(user)/friends-requests-tab/friends-requests-list';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;

    const queryClient = getQueryClient();

    const user = await queryClient.fetchQuery(
      getSuspenseUserQuery({
        variables: { params: { userId: id } },
        fetchOptions: { cache: 'no-cache' },
      })
    );

    const username = user.username;

    return generateNextMetadata({
      title: `Заявки в друзья ${username}`,
      description: `Профиль пользователя ${username}`,
      index: false,
      follow: false,
    });
  }, 'user-friends-requests')
);

export default async function FriendshipRequests(props: NextPageParams<{ id: string }>) {
  const params = await props.params;

  const { id } = params;

  const queryClient = getQueryClient();

  await queryClient.prefetchInfiniteQuery(
    getSuspenseFriendsRequestsPaginatedListQuery({
      variables: {
        params: { userId: id },
        query: { count: 20, page: 1 },
      },
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FriendsRequestsList itemClassName="w-full" />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
