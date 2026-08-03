import React, { ReactNode, Suspense, useEffect, useState } from 'react';

import { getV2NextPageParam, useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import { v2ForumReactionsRetrieveInfiniteOptions } from '@re/api/generated/@tanstack/react-query.gen';
import { createContextSelector } from '@re/core/utils/create-context-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';

import { HorizontalUserCard } from '~entities/user/ui/horizontal-user-card';
import { client } from '~shared/api/client';
import { LikeDislikeType } from '~shared/api/models/post';
import { useInfoModal } from '~shared/lib/info-modal/use-info-modal';
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';

const { Provider: PostReactionsProvider, useStore: usePostReactions } = createContextSelector<
  {
    counts: Record<LikeDislikeType, number>;
    setCounts: React.Dispatch<React.SetStateAction<Record<LikeDislikeType, number>>>;
    dir: string;
    type: LikeDislikeType;
  },
  {
    dir: string;
    type: LikeDislikeType;
  }
>((v) => {
  const [counts, setCounts] = useState<Record<LikeDislikeType, number>>({
    [LikeDislikeType.LIKE]: 0,
    [LikeDislikeType.DISLIKE]: 0,
  });

  return { ...v, counts, setCounts };
});

const PostUserReactions = ({ type }: { type: LikeDislikeType }) => {
  const setCounts = usePostReactions((v) => v.setCounts);
  const dir = usePostReactions((v) => v.dir);
  const close = useInfoModal((v) => v.close);
  const query = v2ForumReactionsRetrieveInfiniteOptions({
    path: { dir },
    client,
    query: { count: 30, type },
    throwOnError: false,
  });
  query.getNextPageParam = getV2NextPageParam;
  query.initialPageParam = 1;
  const reactionsQuery = useApiGenSuspenseInfiniteQuery(query);

  const count = reactionsQuery.data?.pages?.[0]?.count ?? 0;

  useEffect(() => {
    setCounts((prev) => ({ ...prev, [type]: count }));
  }, [count]);

  const handleClick = () => {
    close();
  };

  const reactions = reactionsQuery.data?.pages?.flatMap((request) => request.results) || [];
  const FlatList: FlatListType<typeof reactions> = _FlatList;
  return (
    <FlatList.Root content={reactions}>
      <FlatList.Layout className="min-h-[250px]" layout="list">
        <FlatList.Content>
          {({ item }) => (
            <HorizontalUserCard key={item.user.id} model={item.user} onClick={handleClick} />
          )}
        </FlatList.Content>
        <FlatList.Empty className="col-span-full">Нет реакций на этот пост</FlatList.Empty>
        <FlatList.EdgeTrigger
          onTrigger={reactionsQuery.fetchNextPage}
          canTrigger={reactionsQuery.hasNextPage}
        />
      </FlatList.Layout>
    </FlatList.Root>
  );
};

const PostUserReactionsTab = ({
  value,
  children,
}: {
  value: LikeDislikeType;
  children: ReactNode;
}) => {
  const counts = usePostReactions((v) => v.counts);

  return (
    <TabsTrigger value={value.toString()}>
      {children} {counts[value] ? `(${counts[value]})` : null}
    </TabsTrigger>
  );
};
const allPostReactionsTabs = [LikeDislikeType.LIKE, LikeDislikeType.DISLIKE];
export const PostReactionsList = ({ dir }: { dir: string }) => {
  const [activeTab, setActiveTab] = useState<LikeDislikeType>(LikeDislikeType.LIKE);

  return (
    <PostReactionsProvider value={{ dir, type: activeTab }}>
      <Tabs
        defaultValue="all"
        onValueChange={(value) => setActiveTab(parseInt(value))}
        className="flex w-full flex-col"
      >
        <TabsList className="self-start">
          <PostUserReactionsTab value={LikeDislikeType.LIKE}>Лайки</PostUserReactionsTab>
          <PostUserReactionsTab value={LikeDislikeType.DISLIKE}>Дизлайки</PostUserReactionsTab>
        </TabsList>

        {allPostReactionsTabs.map((type) => (
          <TabsContent value={type.toString()} key={type}>
            <Suspense fallback="">
              <PostUserReactions type={type} />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs>
    </PostReactionsProvider>
  );
};
