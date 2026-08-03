import { getTranslations } from 'next-intl/server';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getFriendsPaginatedListQuery } from '~entities/friend/model/queries';
import { UserRepository } from '~entities/user/model/repository';
import { Friends } from '~pages/(user)/friends/ui/friends-page';
import { getQueryClient } from '~shared/api/react-query';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('user.pages.friends.meta');

    const user = await UserRepository.userById({ params: { userId: id } }, { cache: 'no-cache' });

    const username = user.username;

    const title = t('title', { username });

    return generateNextMetadata({
      title,
      description: t('description', { username }),
    });
  }, 'user-friends')
);

export default async function FriendsPage(props: NextPageParams<{ id: string }>) {
  const params = await props.params;

  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getFriendsPaginatedListQuery({
      variables: {
        query: { count: 20, page: 1 },
        params: { userId: params.id },
      },
    })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Friends>
        {/*<div className="flex items-center justify-between">*/}
        <Friends.Header />
        {/*<Friends.Ordering />*/}
        {/*</div>*/}
        <Friends.List />
      </Friends>
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
