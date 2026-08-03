'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import * as MediaPrimitive from '@re/ui-kit/ui/media';
import { ReText } from '@re/ui-kit/ui/text';

import { useBadgeById, useOwnersByBadgeId } from '~entities/user/model/queries';
import { VerticalUserCard, VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { FlatList as _FlatList, type FlatListType } from '~shared/ui/flat-list-v2';
import { UrlFormatter } from '~shared/utils/url-formatter';

const OwnersList = () => {
  const { id } = useParams<{ id: string }>();
  const ownersQuery = useOwnersByBadgeId({ variables: { params: { badgeId: id } } });

  const owners = useMemo(
    () => ownersQuery.data?.pages?.flatMap((v) => v?.results) || [],
    [ownersQuery.data]
  );

  const FlatList: FlatListType<typeof owners> = _FlatList;
  return (
    <FlatList.Root
      content={owners}
      isLoading={ownersQuery.isLoading}
      isFetchingNextPage={ownersQuery.isFetchingNextPage}
      className="bg-secondary grow-1 self-stretch rounded-md p-4"
    >
      <FlatList.Layout
        layout="grid"
        className="grid-cols-2 min-[400px]:grid-cols-3 min-[1024px]:grid-cols-5 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      >
        <FlatList.Content>
          {({ item, attributes }) => (
            <VerticalUserCardV2
              {...attributes}
              className="w-full justify-start !border-none"
              key={item.id}
              model={item}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={12}>
          {({ key }) => (
            <VerticalUserCard className="!w-full !border-none" model={null} isLoading key={key} />
          )}
        </FlatList.Loading>
        <FlatList.EdgeTrigger
          canTrigger={!ownersQuery.isFetchingNextPage && ownersQuery.hasNextPage}
          onTrigger={ownersQuery.fetchNextPage}
        />
      </FlatList.Layout>
      <FlatList.Empty text="Пусто" emoji="🎴" className="col-span-full" />
    </FlatList.Root>
  );
};

export const BadgeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: badge } = useBadgeById({ variables: { params: { badgeId: id } } });

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
      {/*todo: Sticky here*/}
      <div className="bg-secondary flex w-[360px] flex-shrink-0 flex-col gap-6 rounded-md p-3 pb-6">
        <MediaPrimitive.Root src={UrlFormatter.media(badge.icon)} className="w-full">
          <MediaPrimitive.Content
            style={{
              userSelect: 'none',
              // @ts-ignore
              unselectable: 'on',
              pointerEvents: 'none',
            }}
            fill
            alt={badge.name}
            className="relative aspect-square size-full rounded-md select-none"
          />
        </MediaPrimitive.Root>
        <ReText align="center" size="xl" weight="semibold">
          {badge.name}
        </ReText>
        {(badge.description ?? '').replace(htmlRegExp, '') ? (
          <ReText align="center" dangerouslySetInnerHTML={{ __html: badge.description ?? '' }} />
        ) : null}
      </div>
      <OwnersList />
    </div>
  );
};
