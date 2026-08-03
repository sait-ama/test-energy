import { redirect } from 'next/navigation';

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getSuspenseUserQuery } from '~entities/user/model/queries';
import { getUserSubscriptionsPaginatedListQuery } from '~entities/user-subscriptions/model/queries';
import { getSubscriptionsPaginatedListQueryParams } from '~entities/user-subscriptions/model/utils/getParams';
import { SubscriptionList } from '~pages/(user)/subscriptions/ui/subscribtions';
import { getQueryClient } from '~shared/api/react-query';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

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
      title: `Подписки ${username}`,
      description: `Профиль пользователя ${username}`,
      canonical: Routing.User.detail({
        params: { id, tab: 'social' as const, subTab: 'subscriptions' },
      }),
    });
  }, 'user-subscriptions')
);

export default async function Subscriptions(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const session = await getSession();
  const queryClient = getQueryClient();
  const { user_id, ...query } = getSubscriptionsPaginatedListQueryParams(params, searchParams);

  if (!user_id)
    return Promise.reject({ message: 'Пользователь не найден', name: 'Неправильный url' });

  const isCurrentUser = session && session.id === user_id;

  if (!isCurrentUser) redirect(Routing.User.detail({ params: { id: user_id, tab: 'about' } }));

  await queryClient.prefetchInfiniteQuery(
    getUserSubscriptionsPaginatedListQuery({
      page: 1,
      count: 20,
      ...query,
      user_id,
    })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SubscriptionList />
    </HydrationBoundary>
  );
}

export const dynamic = 'force-dynamic';
