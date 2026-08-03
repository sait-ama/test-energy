'use client';
import React from 'react';
import { useFormatter, useNow } from 'next-intl';

import { useApiGenSuspenseInfiniteQuery } from '@re/api/exports-core';
import Comments from '@re/ui-kit/icons/comments';
import Like from '@re/ui-kit/icons/like';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { getPostsFeedPaginatedSuspenseListQueryOptions } from '~entities/post/model/queries';
import { Post } from '~entities/post/ui/post-card';
import { client } from '~shared/api/client';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Section, SectionProps, SectionTitle, SectionTitleProps } from '~shared/ui/section';

interface TopPostsRootProps extends SectionProps {}

export const TopPostsRoot = (props: TopPostsRootProps) => {
  const { className, children, ...rest } = props;

  return (
    <Section
      {...rest}
      withBorder={false}
      className={cn(
        'dark:bg-secondary border-border flex w-full flex-col gap-4 border px-0 py-4',
        className
      )}
    >
      {children}
    </Section>
  );
};

interface TopPostsTitleProps extends SectionTitleProps {}

export const TopPostsTitle = (props: TopPostsTitleProps) => {
  const { children, className, ...rest } = props;

  return (
    <SectionTitle className={cn('px-4', className)} {...rest}>
      {children}
    </SectionTitle>
  );
};

export const TopPostsContent = () => {
  const formatter = useFormatter();
  const now = useNow();

  const { data: { pages = [] } = {} } = useApiGenSuspenseInfiniteQuery(
    getPostsFeedPaginatedSuspenseListQueryOptions(
      {
        clientOrdering: 'week',
        query: {
          week: true,
          exclude_tag: [],
          count: 20,
          page: 1,
          search: '',
          tags: [],
        },
        client,
        cache: 'force-cache',
      },
      { refetchOnMount: false, refetchInterval: false, refetchOnWindowFocus: false }
    )
  );
  const topData = pages.flatMap((page) => page.results).filter(Boolean);

  const FlatList: FlatListType<typeof topData> = _FlatList;

  return (
    <FlatList.Root asChild content={topData}>
      <ul className="flex w-full list-none flex-col">
        <ScrollArea className="flex max-h-[80dvh] flex-col gap-2 p-0">
          <FlatList.Content>
            {({ item, index, attributes }) => (
              <li
                key={index}
                className="border-border border-b px-4 py-3 first:pt-0 last:pb-0"
                {...attributes}
              >
                <Post.Root post={item}>
                  <div className="flex flex-col gap-1">
                    <Post.Author avatarSize={28} renderAuthorType={() => null} />
                    <div className="flex flex-col gap-2">
                      <Post.Link>
                        <ReText lineClamp={2} size="sm" weight="medium" className="break-all">
                          {item.header}
                        </ReText>
                      </Post.Link>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Like className="h-3 w-3" />
                          <ReText color="muted-foreground" size="xs">
                            {item.score}
                          </ReText>
                        </div>
                        <div className="flex items-center gap-1">
                          <Comments className="h-3 w-3" />
                          <ReText color="muted-foreground" size="xs">
                            {item.count_comments}
                          </ReText>
                        </div>
                        <ReText color="muted-foreground" size="xs">
                          {formatter.relativeTime(item.created_at, now)}
                        </ReText>
                      </div>
                    </div>
                  </div>
                </Post.Root>
              </li>
            )}
          </FlatList.Content>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <FlatList.Empty emoji="🦉" height="100px" />
      </ul>
    </FlatList.Root>
  );
};
