import type { HTMLAttributes, ReactNode } from 'react';
import { memo } from 'react';

import { InfiniteData } from '@tanstack/query-core';
import { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { LatestChaptersListSkeleton } from '~entities/latest-chapter/ui/latest-chapters-list-skeleton';
import type {
  LatestChapterSchema,
  LatestChaptersListResponseSchema,
} from '~shared/api/models/latest-chapter';
import { EmptyView } from '~shared/ui/empty-view';

//todo
interface RenderItemProps {
  isSublist?: boolean;
}

type RenderItem<T> = (item: T, itemProps?: RenderItemProps) => ReactNode;

interface LatestChaptersListProps {
  query: UseSuspenseInfiniteQueryResult<
    InfiniteData<LatestChaptersListResponseSchema, unknown>,
    BackendValidationError
  >;
  renderItem: RenderItem<LatestChapterSchema>;
  data?: LatestChapterSchema[] | LatestChapterSchema[][];
}

const MemoizedLatestChaptersItem = <T,>({
  renderItem,
  item,
  props,
}: {
  renderItem: RenderItem<T>;
  item: T;
  props?: RenderItemProps;
}) => renderItem(item, props);

const LatestChaptersListPage = <T extends { id: string | number }>({
  content,
  renderItem,
  itemProps,
}: {
  content: T[];
  renderItem: RenderItem<T>;
  itemProps?: RenderItemProps;
}): ReactNode =>
  content.map((item) => (
    <MemoizedLatestChaptersItem
      key={item.id}
      item={item}
      renderItem={renderItem}
      props={itemProps}
    />
  ));

const MemoizedLatestChaptersListPage = memo(
  LatestChaptersListPage,
  (p, n) => p.content === n.content
) as typeof LatestChaptersListPage;

export const LatestChaptersListContainer = ({
  children,
  className,
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex w-full flex-col items-start gap-2 max-sm:px-2', className)}>
    {children}
  </div>
);

const LatestChaptersListContent = ({ query, renderItem }: LatestChaptersListProps) => {
  if (!renderItem) {
    throw new Error('LatestChaptersListContent expects valid renderItem prop');
  }

  if (!query.data?.pages?.length && !query.isLoading) {
    return <EmptyView />;
  }

  const content = query.data?.pages?.map((it) => it.results);
  const fetchNext = async () => {
    await query.fetchNextPage();
  };
  const fetchPrev = async () => {
    await query.fetchPreviousPage();
  };
  const renderFetchPreviousButton = () =>
    query.hasPreviousPage ? (
      <Button variant="link" onClick={fetchPrev}>
        Показать предыдущие
      </Button>
    ) : null;

  const renderFetchNextButton = () =>
    query.hasNextPage ? (
      <Button variant="flat" size="xl" className="mx-auto" onClick={fetchNext}>
        Показать еще
      </Button>
    ) : null;

  return (
    <LatestChaptersListContainer>
      {query.isFetchingPreviousPage ? <LatestChaptersListSkeleton /> : renderFetchPreviousButton()}
      {content.map((page, index) => (
        <MemoizedLatestChaptersListPage key={index} content={page} renderItem={renderItem} />
      ))}
      {query.isFetchingNextPage ? <LatestChaptersListSkeleton /> : renderFetchNextButton()}
    </LatestChaptersListContainer>
  );
};

export const LatestChaptersList = LatestChaptersListContent;
