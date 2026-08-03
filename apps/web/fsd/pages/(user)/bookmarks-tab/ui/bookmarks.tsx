'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';

import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';

import { useContentType } from '~app/providers/site-config-provider';
import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import { useUserBookmarks, useUserBookmarksTypes } from '~entities/user/model/queries';
import type { UserBookmark } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export const BookmarksPage = () => {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const contentType = useContentType();
  const router = useRouter();
  const [bookmarkId, setBookmarkId] = useState<number>(
    parseInt(searchParams.get('bookmarkId') ?? '1')
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useUserBookmarks({
    variables: {
      params: {
        userId: id,
      },
      query: {
        type: bookmarkId,
      },
    },
  });
  const { data: bookmarks } = useUserBookmarksTypes({ variables: { params: { userId: id } } });

  const handleChange = (value: string) => {
    const updatedSearchParams = new URLSearchParams(searchParams.toString());
    updatedSearchParams.set('bookmarkId', value);

    router.push(`${pathname}?${updatedSearchParams.toString()}`);

    setBookmarkId(Number(value));
  };

  const FlatList: FlatListType<UserBookmark[]> = _FlatList;

  return (
    <div className="flex flex-col gap-4">
      <Tabs activationMode="manual" value={String(bookmarkId)} onValueChange={handleChange}>
        <ScrollArea className="">
          <TabsList size="md" variant="default">
            {bookmarks?.results?.map((it) => (
              <TabsTrigger
                key={it.id}
                value={String(it.id)}
                className="flex gap-2 whitespace-nowrap"
              >
                {it.name}
                <ReText
                  size="xs"
                  color={it.id === bookmarkId ? 'primary-foreground' : 'muted-foreground'}
                >
                  {it.count}
                </ReText>
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>
      <FlatList.Root
        content={data?.pages.flatMap((it) => it.results)}
        isLoading={isFetchingNextPage}
        className="cs-bookmarks-section cs-section"
      >
        <FlatList.Layout
          layout="grid"
          className="xs:grid-cols-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-7"
        >
          <FlatList.Content>
            {({ item }) => (
              <Link
                key={item.id}
                prefetch={false}
                href={Routing.Title.detail({
                  params: { dir: item.title.dir, content: contentType, tab: 'main' },
                })}
              >
                <VerticalTitleCard model={item.title} rating={item.rated} />
              </Link>
            )}
          </FlatList.Content>
          <FlatList.Empty className="col-span-full" />
          <FlatList.Loading count={20}>
            {({ key }) => <VerticalTitleCardSkeleton key={key} />}
          </FlatList.Loading>
          <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={hasNextPage} />
        </FlatList.Layout>
      </FlatList.Root>
    </div>
  );
};
