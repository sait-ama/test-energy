'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useCurPublisherDeps } from '~entities/publisher/model/context';
import { useUserSuspenseQuery } from '~entities/user/model/queries';
import {
  useFollowersPaginatedListQuery,
  useSuspenseFollowersPaginatedListQuery,
} from '~entities/user-subscriptions/model/queries';
import { FollowerCard } from '~entities/user-subscriptions/ui/follower-card';
import { ErrorView } from '~features/error-view';
import type { FollowerOrdering, FollowerSchema } from '~shared/api/models/follower';
import { SubContentType } from '~shared/api/models/user-subscriptions';
import { useSession } from '~shared/lib/session/use-session';
import { EmptyView } from '~shared/ui/empty-view';
import { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export const FollowersSlider = () => {
  const { id } = useParams<{ id: string }>();
  const { data: { pages = [] } = {}, isPending } = useFollowersPaginatedListQuery('author_users');
  const curId = useSession((v) => v?.id) ?? {};
  const { data: user } = useUserSuspenseQuery({ variables: { params: { userId: id } } });
  const t = useTranslations('common');

  if (!user!.count_subscribers)
    return <EmptyView height="100px" text="Здесь ничего нет" emoji="💜" />;

  const followers = pages.flatMap((page) => page.results).slice(0, 14);

  const FlatList: FlatListType<FollowerSchema[]> = _FlatList;

  return (
    <ErrorBoundary fallback={<ErrorView className="m-auto" />}>
      <FlatList.Root content={followers}>
        <FlatList.Layout
          layout="grid"
          // className="grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
        >
          <FlatList.Content>
            {({ item, index }) => (
              <FollowerCard
                isLoading={isPending}
                key={index}
                subType="author_users"
                model={{
                  ...item,
                  username: curId === item?.id ? t.raw('you') : item?.username,
                }}
              />
            )}
          </FlatList.Content>
          <FlatList.Empty height="100px" text="Здесь ничего нет" emoji="💜" />
        </FlatList.Layout>
      </FlatList.Root>
    </ErrorBoundary>
  );
};
const subs = ['author_publishers', 'titles_publishers'] satisfies SubContentType[];
export const FollowersPublisher = () => {
  const searchParams = useSearchParams();
  const entityId = useCurPublisherDeps((v) => v.publisherId);
  const ordering = (searchParams.get('ordering') as FollowerOrdering) ?? '-id';
  const { data: { pages = [] } = {}, isPending } = useSuspenseFollowersPaginatedListQuery({
    variables: {
      query: { ordering, count: 20, page: 1, sub_type: 'author_publishers', id: entityId },
    },
  });
  const { data: { pages: pages1 = [] } = {}, isPending: isPending1 } =
    useSuspenseFollowersPaginatedListQuery({
      variables: {
        query: { ordering, count: 20, page: 1, sub_type: 'titles_publishers', id: entityId },
      },
    });
  const followers = [
    ...pages.flatMap((page) => page.results).map((v) => ({ ...v, sub_type: 'author_publishers' })),
    ...pages1.flatMap((v) => v.results).map((v) => ({ ...v, sub_type: 'titles_publishers' })),
  ];
  const curId = useSession((v) => v?.id);
  const t = useTranslations('common');

  const FlatList: FlatListType<FollowerSchema[]> = _FlatList;

  return (
    <FlatList.Root content={followers} isLoading={false}>
      <FlatList.Layout layout="grid">
        <FlatList.Content>
          {({ item, index }) => (
            <FollowerCard
              isLoading={isPending || isPending1}
              subType={item.sub_type}
              model={{
                ...item,
                username: curId === item?.id ? t.raw('you') : item?.username,
              }}
              key={index}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key, index }) => (
            <FollowerCard
              key={key}
              isLoading
              subType={index % 2 === 0 ? subs[0]! : subs[1]!}
              model={{}}
            />
          )}
        </FlatList.Loading>

        <FlatList.Empty
          height="100px"
          isEmpty={!isPending && !isPending1}
          text="Здесь ничего нет"
          emoji="💜"
        />
      </FlatList.Layout>
    </FlatList.Root>
  );
};
